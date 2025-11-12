import { json } from "../utils/json.js";
import { sbInsertUser, sbSelectOneByEmail } from "../lib/supabase.js";
import { hashPassword, verifyPassword } from "../lib/crypto.js";
import { signJwt, verifyJwt } from "../lib/jwt.js";

function getBearer(req) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

function requireEnv(env, keys) {
  const miss = keys.filter(k => !env[k]);
  if (miss.length) {
    const err = new Error("Missing env: " + miss.join(", "));
    err.code = "ENV_MISSING";
    throw err;
  }
}

const REVEAL = (env) => env.REVEAL_ERRORS === "true";

export async function postRegister(request, env) {
  try {
    requireEnv(env, ["SUPABASE_URL", "JWT_SECRET"]); // + 서비스키는 lib/supabase에서 검사
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const nickname = body.nickname ? String(body.nickname).trim() : null;

    if (!email || !password) return json({ message: "email/password required" }, 400);

    const exists = await sbSelectOneByEmail(env, email);
    if (exists) return json({ message: "email already registered" }, 409);

    const password_hash = await hashPassword(password);
    const user = await sbInsertUser(env, { email, password_hash, nickname });

    const token = await signJwt(env, { sub: user.id, email: user.email, nickname: user.nickname });
    return json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    console.error("postRegister error:", e);
    return json({ message: "Server Error", ...(REVEAL(env) ? { reason: e.message } : {}) }, 500);
  }
}

export async function postLogin(request, env) {
  try {
    requireEnv(env, ["SUPABASE_URL", "JWT_SECRET"]);
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return json({ message: "email/password required" }, 400);

    const user = await sbSelectOneByEmail(env, email);
    if (!user) return json({ message: "invalid credentials" }, 401);

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return json({ message: "invalid credentials" }, 401);

    const token = await signJwt(env, { sub: user.id, email: user.email, nickname: user.nickname });
    return json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    console.error("postLogin error:", e);
    return json({ message: "Server Error", ...(REVEAL(env) ? { reason: e.message } : {}) }, 500);
  }
}

export async function getMe(request, env) {
  try {
    const token = getBearer(request);
    if (!token) return json({ message: "Unauthorized" }, 401);
    const payload = await verifyJwt(env, token);
    return json({ user: { id: payload.sub, email: payload.email, nickname: payload.nickname ?? null } });
  } catch {
    return json({ message: "Invalid token" }, 401);
  }
}
