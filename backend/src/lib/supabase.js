// src/lib/supabase.js
const REST = "/rest/v1";

function getServiceKey(env) {
  return (
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_ROLE ||
    env.SUPABASE_ANON_KEY
  );
}

function headers(env) {
  const key = getServiceKey(env);
  if (!env.SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
  if (!key)
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE)"
    );
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    prefer: "return=representation",
  };
}

export async function sbSelectOneByEmail(env, email) {
  const url = new URL(`${env.SUPABASE_URL}${REST}/users`);
  url.searchParams.set("email", `eq.${email}`);
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: headers(env) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase select error: ${res.status} ${text}`);
  const arr = text ? JSON.parse(text) : [];
  return arr?.[0] || null;
}

export async function sbInsertUser(env, row) {
  const url = `${env.SUPABASE_URL}${REST}/users`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase insert error: ${res.status} ${text}`);
  const arr = text ? JSON.parse(text) : [];
  return arr?.[0] || null;
}

/** ✅ id로 유저 한 명 조회 */
export async function sbSelectUserById(env, id) {
  const url = new URL(`${env.SUPABASE_URL}${REST}/users`);
  url.searchParams.set("id", `eq.${id}`);
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: headers(env) });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`Supabase select by id error: ${res.status} ${text}`);
  const arr = text ? JSON.parse(text) : [];
  return arr?.[0] || null;
}

/** ✅ 프로필(birth / first_day / mbti) 업데이트 */
export async function sbUpdateUserProfile(env, userId, patch) {
  const url = new URL(`${env.SUPABASE_URL}${REST}/users`);
  url.searchParams.set("id", `eq.${userId}`);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: headers(env),
    body: JSON.stringify(patch),
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(
      `Supabase update profile error: ${res.status} ${text}`
    );
  const arr = text ? JSON.parse(text) : [];
  return arr?.[0] || null;
}
