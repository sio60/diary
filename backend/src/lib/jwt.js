import { SignJWT, jwtVerify } from "jose";

function getKey(env) {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signJwt(env, payload, expSeconds = 60 * 60 * 24 * 7) {
  const key = getKey(env);
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expSeconds)
    .sign(key);
}

export async function verifyJwt(env, token) {
  const key = getKey(env);
  const { payload } = await jwtVerify(token, key);
  return payload;
}
