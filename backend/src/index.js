import { withCORS, preflight } from "./utils/cors.js";
import { json } from "./utils/json.js";
import { postRegister, postLogin, getMe } from "./routes/auth.js";

export default {
  async fetch(request, env, ctx) {
    // CORS 프리플라이트
    const pf = preflight(env, request);
    if (pf) return pf;

    const url = new URL(request.url);
    const { pathname } = url;

    try {
      // 라우팅
      if (request.method === "POST" && pathname === "/auth/register") {
        return withCORS(env, await postRegister(request, env));
      }
      if (request.method === "POST" && pathname === "/auth/login") {
        return withCORS(env, await postLogin(request, env));
      }
      if (request.method === "GET" && pathname === "/auth/me") {
        return withCORS(env, await getMe(request, env));
      }

      // 헬스체크
      if (request.method === "GET" && pathname === "/") {
        return withCORS(env, json({ ok: true, service: "exchange-diary-api" }));
      }

      return withCORS(env, json({ message: "Not Found" }, { status: 404 }));
    } catch (e) {
      console.error(e);
      return withCORS(env, json({ message: "Server Error" }, { status: 500 }));
    }
  },
};
