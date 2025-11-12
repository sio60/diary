// PBKDF2 (Workers 호환), base64url 인/디코딩 보완 + 안전 비교

const ITER = 100_000;
const KEYLEN = 32;

const te = new TextEncoder();

function base64urlEncode(bytes) {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function base64urlPad(b64u) {
  // 길이가 4의 배수가 되도록 '=' 패딩
  const pad = (4 - (b64u.length % 4)) % 4;
  return b64u + "=".repeat(pad);
}

function base64urlDecodeToBytes(b64u) {
  const b64 = base64urlPad(b64u).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function constTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// 해시 포맷: pbkdf2$<iterations>$<salt_b64url>$<hash_b64url>
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", te.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", iterations: ITER, salt },
    key,
    KEYLEN * 8
  );
  const saltB64u = base64urlEncode(salt);
  const hashB64u = base64urlEncode(bits);
  return `pbkdf2$${ITER}$${saltB64u}$${hashB64u}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterStr, saltB64u, hashB64u] = String(stored).split("$");
  if (scheme !== "pbkdf2") return false;
  const iterations = parseInt(iterStr, 10);
  if (!iterations || !saltB64u || !hashB64u) return false;

  const salt = base64urlDecodeToBytes(saltB64u);
  const key = await crypto.subtle.importKey("raw", te.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", iterations, salt },
    key,
    KEYLEN * 8
  );
  const given = base64urlDecodeToBytes(hashB64u);
  const calc  = new Uint8Array(bits);
  return constTimeEqual(calc, given);
}
