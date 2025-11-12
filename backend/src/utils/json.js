export function json(body, init = {}) {
  let status = 200, headers = {};
  if (typeof init === "number") {
    status = init;
  } else if (init && typeof init === "object") {
    status = init.status ?? 200;
    headers = init.headers ?? {};
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}
