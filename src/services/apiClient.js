const API_BASE = import.meta.env.VITE_API_BASE || '';
const responseCache = new Map();
const inflightRequests = new Map();

const TTL_RULES = [
  { prefix: '/api/v1/enums/', ttlMs: 10 * 60 * 1000 },
  { prefix: '/api/v1/organizations/dropdowns/', ttlMs: 5 * 60 * 1000 },
  { prefix: '/api/v1/organizations/', ttlMs: 20 * 1000 },
];

const DEFAULT_GET_TTL_MS = 15 * 1000;

function clonePayload(payload) {
  if (payload == null) return payload;
  if (typeof structuredClone === 'function') return structuredClone(payload);
  return JSON.parse(JSON.stringify(payload));
}

function resolveTtlMs(path, customTtlMs) {
  if (Number.isFinite(customTtlMs) && customTtlMs >= 0) return customTtlMs;
  const matched = TTL_RULES.find((rule) => path.startsWith(rule.prefix));
  return matched ? matched.ttlMs : DEFAULT_GET_TTL_MS;
}

function cacheTagsForPath(path) {
  if (!path.startsWith('/api/')) return ['api'];
  if (path.startsWith('/api/v1/organizations/')) return ['organizations'];
  if (path.startsWith('/api/v1/enums/')) return ['enums'];
  if (path.startsWith('/api/v1/dashboard')) return ['dashboard'];
  if (path.startsWith('/api/v1/employee-hr/')) return ['employee-hr'];
  if (path.startsWith('/api/v1/role-permission-system/')) return ['role-permission-system'];
  return ['api'];
}

function invalidateCacheByTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return;
  for (const [key, value] of responseCache.entries()) {
    const hasOverlap = (value.tags || []).some((tag) => tags.includes(tag));
    if (hasOverlap) responseCache.delete(key);
  }
}

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') sp.append(k, v);
    });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export async function apiFetch(path, { method = 'GET', token, body, params, cacheTtlMs, skipCache = false } = {}) {
  const upperMethod = method.toUpperCase();
  const requestPath = `${path}${buildQuery(params)}`;
  const cacheKey = `${upperMethod}|${token || ''}|${requestPath}`;
  const tags = cacheTagsForPath(path);

  if (upperMethod === 'GET' && !skipCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return clonePayload(cached.payload);
    }
    const inFlight = inflightRequests.get(cacheKey);
    if (inFlight) return inFlight;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Session-Token'] = token;

  const fetchPromise = (async () => {
    const res = await fetch(`${API_BASE}${requestPath}`, {
      method: upperMethod,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 204) {
      if (upperMethod !== 'GET') invalidateCacheByTags(tags);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      let message = payload?.message || payload || `Request failed (${res.status})`;
      if (typeof message === 'string') {
        if (message.includes('<!doctype html') || message.includes('<html')) {
          message = `Server error (${res.status})`;
        }
      }
      if (res.status >= 500 && !String(message).toLowerCase().includes('server error')) {
        message = `Server error (${res.status}): ${message}`;
      }
      throw new Error(message);
    }

    if (upperMethod === 'GET' && !skipCache) {
      const ttlMs = resolveTtlMs(path, cacheTtlMs);
      responseCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + ttlMs,
        tags,
      });
    } else {
      invalidateCacheByTags(tags);
    }

    return payload;
  })();

  if (upperMethod === 'GET' && !skipCache) inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    if (upperMethod === 'GET' && !skipCache) inflightRequests.delete(cacheKey);
  }
}
