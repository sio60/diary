export function withCORS(env, res) {
  const origin = env.CORS_ORIGIN || "*";
  const headers = new Headers(res.headers);
  headers.set("access-control-allow-origin", origin);
  headers.set("access-control-allow-headers", "authorization,content-type");
  headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  headers.set("access-control-expose-headers", "content-type");

  return new Response(res.body, {
    status: res.status,           // ✅ 상태 보존
    statusText: res.statusText,   // ✅ 상태문구 보존
    headers,
  });
}

export function preflight(env, request) {
  if (request.method !== "OPTIONS") return null;
  const origin = env.CORS_ORIGIN || "*";
  const headers = new Headers();
  headers.set("access-control-allow-origin", origin);
  headers.set(
    "access-control-allow-headers",
    request.headers.get("access-control-request-headers") || "authorization,content-type"
  );
  headers.set(
    "access-control-allow-methods",
    request.headers.get("access-control-request-method") || "GET,POST,OPTIONS"
  );
  headers.set("access-control-max-age", "86400");
  return new Response(null, { status: 204, headers });
}
