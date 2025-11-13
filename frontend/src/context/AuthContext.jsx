import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  apiLogin, apiRegister, apiMe, apiGetProfile, tokenStore
} from "../lib/api";

const AuthCtx = createContext(null);
const DEV = __DEV__;
const dbg = (...a) => DEV && console.log("[Auth]", ...a);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // user 병합 헬퍼
  const mergeUser = useCallback((me, profile) => {
    const u = me?.user || me || {};
    return { ...u, ...(profile || {}) };
  }, []);

  // 프로필 리프레시(외부 노출용)
  const refreshUser = useCallback(async () => {
    try {
      const t = await tokenStore.getToken();
      if (!t) { setUser(null); return null; }
      const me = await apiMe();                // { user }
      let profile = {};
      try { profile = await apiGetProfile(); } catch {}
      const merged = mergeUser(me, profile);   // { id, email, nickname, birth, first_day, mbti ...}
      setUser(merged);
      return merged;
    } catch (e) {
      dbg("refreshUser:error", e?.message || String(e));
      setUser(null);
      await tokenStore.setToken(null);
      return null;
    }
  }, [mergeUser]);

  // 초기 하이드레이트
  useEffect(() => {
    (async () => { await refreshUser(); setLoading(false); })();
  }, [refreshUser]);

  // 프로필 로컬 업데이트 (화면에서 즉시 반영)
  const updateProfileLocal = useCallback((patch) => {
    setUser((u) => (u ? { ...u, ...patch } : patch));
  }, []);

  const login = async ({ email, password }) => {
    dbg("login:req", email);
    const data = await apiLogin({ email, password }); // { token, user }
    await tokenStore.setToken(data.token);
    await refreshUser(); // 로그인 직후 프로필까지 머지
    return data;
  };

  const register = async ({ email, password, nickname }) => {
    dbg("register:req", email, nickname);
    const data = await apiRegister({ email, password, nickname });
    await tokenStore.setToken(data.token);
    await refreshUser(); // 회원가입 직후 프로필까지 머지
    return data;
  };

  const logout = async () => {
    dbg("logout");
    await tokenStore.setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refreshUser, updateProfileLocal }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
