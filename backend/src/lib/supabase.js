const REST = "/rest/v1";

function headers(env) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    prefer: "return=representation",
  };
}

export async function sbSelectOneByEmail(env, email) {
  const url = new URL(`${env.SUPABASE_URL}${REST}/users`);
  url.searchParams.set("email", `eq.${email}`);
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: headers(env) });
  if (!res.ok) throw new Error(`Supabase select error: ${res.status}`);
  const arr = await res.json();
  return arr?.[0] || null;
}

export async function sbInsertUser(env, row) {
  const url = `${env.SUPABASE_URL}${REST}/users`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase insert error: ${res.status} ${t}`);
  }
  const arr = await res.json();
  return arr?.[0] || null;
}
