// 해시 포맷: pbkdf2$<iterations>$<salt_b64url>$<hash_b64url>
const ITER = 100_000;
const KEYLEN = 32;

function b64url(bytes) {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromStr(s) {
  return new TextEncoder().encode(s);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", fromStr(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", iterations: ITER, salt },
    key,
    KEYLEN * 8
  );
  const out = b64url(bits);
  const saltB64 = b64url(salt);
  return `pbkdf2$${ITER}$${saltB64}$${out}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const iterations = parseInt(iterStr, 10);
  const salt = Uint8Array.from(atob(saltB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", fromStr(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", iterations, salt },
    key,
    KEYLEN * 8
  );
  const out = b64url(bits);
  return out === hashB64;
}
