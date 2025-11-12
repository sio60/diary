import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  Constants.expoConfig?.extra?.apiBase ||
  "";

if (!API_BASE) {
  console.warn("⚠ EXPO_PUBLIC_API_BASE 미설정: .env 확인");
}

const TOKEN_KEY = "auth-token";

export async function getToken() {
  return (await SecureStore.getItemAsync(TOKEN_KEY)) || null;
}

export async function setToken(t) {
  if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function doFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = await getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** 회원가입: {email, password, nickname} → { token, user } */
export async function apiRegister(payload) {
  return await doFetch("/auth/register", { method: "POST", body: payload });
}

/** 로그인: {email, password} → { token, user } */
export async function apiLogin(payload) {
  return await doFetch("/auth/login", { method: "POST", body: payload });
}

/** 내 정보 */
export async function apiMe() {
  return await doFetch("/auth/me", { auth: true });
}

export const tokenStore = { getToken, setToken, TOKEN_KEY };
