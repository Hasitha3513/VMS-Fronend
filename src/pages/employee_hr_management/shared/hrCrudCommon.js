export const req = (v) => (v ?? '').toString().trim();

export const opt = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '' ? null : s;
};

export const toInt = (v) => {
  const s = opt(v);
  return s == null ? null : Number.parseInt(s, 10);
};

export const toDecimal = (v) => {
  const s = opt(v);
  if (s == null) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

export const toBool = (v) => (v === '' || v == null ? null : String(v) === 'true');

export const rowsFrom = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fmtDate = (v) => (v ? String(v) : '-');

export const fmtMoney = (v) => {
  if (v == null || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const getOwnCompanyPrefill = (auth, companies) => {
  if (!auth?.companyCode) return null;
  const own = companies.find(
    (c) => String(c.code).toLowerCase() === String(auth.companyCode).toLowerCase()
  );
  if (!own) return null;
  return { companyId: String(own.id), companyCode: own.code };
};
