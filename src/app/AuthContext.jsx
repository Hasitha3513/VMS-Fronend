import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const KEY = 'vms_auth';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const PING_INTERVAL_MS = 60 * 1000;
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 5 * 1000;

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = (payload) => {
    setAuth(payload);
    localStorage.setItem(KEY, JSON.stringify(payload));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem(KEY);
  };

  const lastActivityAtRef = useRef(Date.now());
  const lastRecordedActivityAtRef = useRef(0);
  const lastPingAtRef = useRef(0);

  useEffect(() => {
    if (!auth?.sessionToken) return undefined;

    const onActivity = () => {
      const now = Date.now();
      if (now - lastRecordedActivityAtRef.current < ACTIVITY_THROTTLE_MS) return;
      lastRecordedActivityAtRef.current = now;
      lastActivityAtRef.current = now;
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));

    const intervalId = window.setInterval(async () => {
      const now = Date.now();
      const isRecentlyActive = now - lastActivityAtRef.current <= ACTIVE_WINDOW_MS;
      if (!isRecentlyActive) return;
      if (now - lastPingAtRef.current < PING_INTERVAL_MS) return;
      lastPingAtRef.current = now;
      try {
        const session = await authService.ping(auth.sessionToken);
        if (session?.expiresAt) {
          setAuth((prev) => {
            if (!prev) return prev;
            const next = { ...prev, expiresAt: session.expiresAt };
            localStorage.setItem(KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch {
        // Ignore ping failures; regular API calls will surface auth errors if session is invalid.
      }
    }, PING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    };
  }, [auth?.sessionToken]);

  const value = useMemo(() => ({ auth, token: auth?.sessionToken, login, logout }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
