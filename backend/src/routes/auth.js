import { json } from "../utils/json.js";
import { sbInsertUser, sbSelectOneByEmail } from "../lib/supabase.js";
import { hashPassword, verifyPassword } from "../lib/crypto.js";
import { signJwt, verifyJwt } from "../lib/jwt.js";

function getBearer(req) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function postRegister(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const nickname = body.nickname ? String(body.nickname).trim() : null;

  if (!email || !password) {
    return json({ message: "email/password required" }, { status: 400 });
  }
  const exists = await sbSelectOneByEmail(env, email);
  if (exists) return json({ message: "email already registered" }, { status: 409 });

  const password_hash = await hashPassword(password);
  const user = await sbInsertUser(env, { email, password_hash, nickname });

  const token = await signJwt(env, { sub: user.id, email: user.email, nickname: user.nickname });
  return json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
}

export async function postLogin(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return json({ message: "email/password required" }, { status: 400 });

  const user = await sbSelectOneByEmail(env, email);
  if (!user) return json({ message: "invalid credentials" }, { status: 401 });

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return json({ message: "invalid credentials" }, { status: 401 });

  const token = await signJwt(env, { sub: user.id, email: user.email, nickname: user.nickname });
  return json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
}

export async function getMe(request, env) {
  const token = getBearer(request);
  if (!token) return json({ message: "Unauthorized" }, { status: 401 });
  try {
    const payload = await verifyJwt(env, token);
    // 필요 시 Supabase에서 fresh 조회 가능
    return json({ user: { id: payload.sub, email: payload.email, nickname: payload.nickname ?? null } });
  } catch {
    return json({ message: "Invalid token" }, { status: 401 });
  }
}
