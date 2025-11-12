import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiLogin, apiRegister, apiMe, tokenStore } from "../lib/api";

const AuthCtx = createContext(null);

// 🔧 DEV 로그
const DEV = __DEV__;
const dbg = (...a) => DEV && console.log("[Auth]", ...a);

// ✅ 응답 스키마 강제: { token, user:{...} } 없으면 에러
function expectAuthPayload(data, label) {
  if (!data || typeof data !== "object" || !data.token || !data.user) {
    const snap = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`${label} 응답 형식 오류: token/user 누락 → ${snap?.slice(0,120)}`);
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    dbg("hydrate:start");
    try {
      const t = await tokenStore.getToken();
      dbg("hydrate:token?", !!t, t ? t.slice(0,12) + "..." : null);
      if (!t) { setUser(null); return; }
      const me = await apiMe();           // 기대: { user:{...} }
      dbg("hydrate:me", me?.user);
      setUser(me?.user || null);
    } catch (e) {
      dbg("hydrate:error", e?.message || String(e));
      setUser(null);
      await tokenStore.setToken(null);    // 토큰 불일치/만료 정리
    }
  }, []);

  useEffect(() => {
    (async () => { await hydrate(); setLoading(false); })();
  }, [hydrate]);

  const login = async ({ email, password }) => {
    dbg("login:req", email);
    const raw = await apiLogin({ email, password });   // api.js에서 fetch
    const data = expectAuthPayload(raw, "login");      // ✨ 스키마 보증
    await tokenStore.setToken(data.token);
    setUser(data.user);
    dbg("login:ok", data.user?.id || data.user?.email);
    return data;
  };

  const register = async ({ email, password, nickname }) => {
    dbg("register:req", email, nickname);
    const raw = await apiRegister({ email, password, nickname });
    const data = expectAuthPayload(raw, "register");   // ✨ 스키마 보증
    await tokenStore.setToken(data.token);
    setUser(data.user);
    dbg("register:ok", data.user?.id || data.user?.email);
    return data;
  };

  const logout = async () => {
    dbg("logout");
    await tokenStore.setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
