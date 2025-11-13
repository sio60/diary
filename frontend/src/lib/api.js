import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  Constants.expoConfig?.extra?.apiBase ||
  "";

const TOKEN_KEY = "auth-token";
const DEV = __DEV__;
const dbg = (...a) => DEV && console.log("[API]", ...a);

export async function getToken() {
  return (await SecureStore.getItemAsync(TOKEN_KEY)) || null;
}
export async function setToken(t) {
  t
    ? await SecureStore.setItemAsync(TOKEN_KEY, t)
    : await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function doFetch(path, { method = "GET", body, auth = false } = {}) {
  // 백엔드가 // 를 1개로 정규화하니 여기선 단순 결합
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = await getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  dbg(method, url, body ? JSON.stringify(body) : "");
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get("content-type") || "";
  const txt = await res.text();
  dbg("status", res.status, "ct", ct, "text", txt.slice(0, 160));

  let data = null;
  if (ct.includes("application/json")) {
    try {
      data = txt ? JSON.parse(txt) : null;
    } catch {}
  }

  if (!res.ok) {
    throw new Error(
      (data && (data.message || data.error)) || `HTTP ${res.status}`
    );
  }
  return data ?? { raw: txt };
}

// ===== Auth =====
function expectAuthPayload(d, label) {
  if (!d || typeof d !== "object" || !d.token || !d.user) {
    throw new Error(`${label} 응답 형식 오류: token/user 누락 (${JSON.stringify(d)})`);
  }
  return d;
}

export async function apiRegister(payload) {
  const d = await doFetch("/auth/register", { method: "POST", body: payload });
  return expectAuthPayload(d, "register");
}
export async function apiLogin(payload) {
  const d = await doFetch("/auth/login", { method: "POST", body: payload });
  return expectAuthPayload(d, "login");
}
export async function apiMe() {
  // 기대 형태: { user: {...} }
  return await doFetch("/auth/me", { auth: true });
}

// ===== Profile =====
// 서버가 { profile: {...} } 또는 {...} 로 줄 가능성 둘 다 흡수
const pickProfile = (r) => (r?.profile ? r.profile : r) || {};

export async function apiGetProfile() {
  const d = await doFetch("/profile", { auth: true });
  return pickProfile(d);
}
export async function apiUpsertProfile(payload) {
  const d = await doFetch("/profile", {
    method: "POST",
    body: payload,
    auth: true,
  });
  return pickProfile(d);
}

// 하위 호환 (이름 유지)
export const apiUpdateProfile = apiUpsertProfile;

export const tokenStore = { getToken, setToken, TOKEN_KEY };
