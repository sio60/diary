import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || Constants.expoConfig?.extra?.apiBase || "";
const TOKEN_KEY = "auth-token";
const DEV = __DEV__;
const dbg = (...a)=>DEV&&console.log("[API]", ...a);

export async function getToken(){ return (await SecureStore.getItemAsync(TOKEN_KEY)) || null; }
export async function setToken(t){ t ? await SecureStore.setItemAsync(TOKEN_KEY,t) : await SecureStore.deleteItemAsync(TOKEN_KEY); }

async function doFetch(path, { method="GET", body, auth=false } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type":"application/json" };
  if (auth) {
    const t = await getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  dbg(method, url, body ? JSON.stringify(body) : "");
  console.time(`[API] ${method} ${path}`);

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  console.timeEnd(`[API] ${method} ${path}`);
  dbg("status", res.status, "ct", ct, "text", text.slice(0,120));

  let data = null;
  if (ct.includes("application/json")) {
    try { data = text ? JSON.parse(text) : null; } catch {}
  }
  // JSON 아니면 그대로 에러 처리
  if (!res.ok) {
    throw new Error((data && (data.message||data.error)) || `HTTP ${res.status}`);
  }
  return data ?? { raw:text };
}

function expectAuthPayload(data, label){
  if (!data || typeof data!=="object" || !data.token || !data.user) {
    // 여기서 바로 실패시켜서 화면에 Alert 띄우게
    throw new Error(`${label} 응답 형식 오류: token/user 누락 (${JSON.stringify(data).slice(0,120)})`);
  }
  return data;
}

export async function apiRegister(payload){
  const d = await doFetch("/auth/register", { method:"POST", body: payload });
  return expectAuthPayload(d, "register");
}
export async function apiLogin(payload){
  const d = await doFetch("/auth/login", { method:"POST", body: payload });
  return expectAuthPayload(d, "login");
}
export async function apiMe(){
  return await doFetch("/auth/me", { auth:true });
}

export const tokenStore = { getToken, setToken, TOKEN_KEY };
