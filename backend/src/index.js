// src/index.js
import { withCORS, preflight } from "./utils/cors.js";
import { json } from "./utils/json.js";
import { postRegister, postLogin, getMe } from "./routes/auth.js";
import { getProfile, upsertProfile } from "./routes/profile.js";

export default {
  async fetch(request, env, ctx) {
    const pf = preflight(env, request);
    if (pf) return pf;

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/{2,}/g, "/");
    console.log("ENTRY", request.method, pathname);

    try {
      if (request.method === "POST" && pathname === "/auth/register") {
        return withCORS(env, await postRegister(request, env));
      }
      if (request.method === "POST" && pathname === "/auth/login") {
        return withCORS(env, await postLogin(request, env));
      }
      if (request.method === "GET" && pathname === "/auth/me") {
        return withCORS(env, await getMe(request, env));
      }

      // ✅ profile
      if (request.method === "GET" && pathname === "/profile") {
        return withCORS(env, await getProfile(request, env));
      }
      if (request.method === "POST" && pathname === "/profile") {
        return withCORS(env, await upsertProfile(request, env));
      }

      if (request.method === "GET" && pathname === "/") {
        return withCORS(env, json({ ok: true, service: "diary" }));
      }

      // json 헬퍼가 (data, init) 형식이니까 이렇게 써주는 게 안전
      return withCORS(
        env,
        json({ message: "Not Found", path: pathname }, { status: 404 })
      );
    } catch (e) {
      console.error(e);
      return withCORS(
        env,
        json({ message: "Server Error" }, { status: 500 })
      );
    }
  },
};
