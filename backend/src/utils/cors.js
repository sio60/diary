// utils/cors.js

export function withCORS(env, res, request) {
  const requestOrigin = request.headers.get("origin") || "";

  // 여러 Origin 입력 지원 (쉼표 구분)
  const allowedList = (env.CORS_ORIGIN || "")
    .split(",")
    .map(o => o.trim())
    .filter(o => o.length > 0);

  let allowOrigin = "";

  // 1) Expo Go 주소 자동 허용 (exp:// 로 시작하면)
  if (requestOrigin.startsWith("exp://")) {
    allowOrigin = requestOrigin;
  }
  // 2) 명시한 Origin 중 매칭 되는 것 허용
  else if (allowedList.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
  }
  // 3) 그 외는 기본 정책 적용 (필요하면 "*" 가능)
  else if (env.CORS_ORIGIN === "*") {
    allowOrigin = "*";
  }

  const headers = new Headers(res.headers);
  if (allowOrigin) headers.set("Access-Control-Allow-Origin", allowOrigin);

  headers.set("Access-Control-Allow-Headers", "authorization,content-type");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Expose-Headers", "content-type");
  headers.set("Cache-Control", "no-store");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export function preflight(env, request) {
  if (request.method !== "OPTIONS") return null;

  const requestOrigin = request.headers.get("origin") || "";

  const allowedList = (env.CORS_ORIGIN || "")
    .split(",")
    .map(o => o.trim())
    .filter(o => o.length > 0);

  let allowOrigin = "";

  if (requestOrigin.startsWith("exp://")) {
    allowOrigin = requestOrigin;
  } else if (allowedList.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
  } else if (env.CORS_ORIGIN === "*") {
    allowOrigin = "*";
  }

  const headers = new Headers();
  if (allowOrigin) headers.set("Access-Control-Allow-Origin", allowOrigin);

  headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ||
      "authorization,content-type"
  );
  headers.set(
    "Access-Control-Allow-Methods",
    request.headers.get("access-control-request-method") ||
      "GET,POST,OPTIONS"
  );
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(null, { status: 204, headers });
}
