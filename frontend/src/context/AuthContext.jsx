import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Alert } from "react-native";
import { apiLogin, apiRegister, apiMe, tokenStore } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      const t = await tokenStore.getToken();
      if (!t) {
        setUser(null);
        return;
      }
      const { user } = await apiMe();
      setUser(user || null);
    } catch {
      setUser(null);
      await tokenStore.setToken(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await hydrate();
      setLoading(false);
    })();
  }, [hydrate]);

  const login = async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    await tokenStore.setToken(data.token);
    setUser(data.user);
  };

  const register = async ({ email, password, nickname }) => {
    const data = await apiRegister({ email, password, nickname });
    await tokenStore.setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
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
