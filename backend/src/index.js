// src/index.js
import { withCORS, preflight } from "./utils/cors.js";
import { json } from "./utils/json.js";
import { postRegister, postLogin, getMe } from "./routes/auth.js";
import { getProfile, upsertProfile } from "./routes/profile.js";

export default {
  async fetch(request, env, ctx) {
    // CORS preflight 처리
    const pf = preflight(env, request);
    if (pf) return pf;

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/{2,}/g, "/");
    console.log("ENTRY", request.method, pathname);

    try {
      // === Auth 라우트들 ===
      if (request.method === "POST" && pathname === "/auth/register") {
        const res = await postRegister(request, env);
        return withCORS(env, res, request);
      }

      if (request.method === "POST" && pathname === "/auth/login") {
        const res = await postLogin(request, env);
        return withCORS(env, res, request);
      }

      if (request.method === "GET" && pathname === "/auth/me") {
        const res = await getMe(request, env);
        return withCORS(env, res, request);
      }

      // === Profile 라우트들 ===
      if (request.method === "GET" && pathname === "/profile") {
        const res = await getProfile(request, env);
        return withCORS(env, res, request);
      }

      if (request.method === "POST" && pathname === "/profile") {
        const res = await upsertProfile(request, env);
        return withCORS(env, res, request);
      }

      // 루트 핑
      if (request.method === "GET" && pathname === "/") {
        const res = json({ ok: true, service: "diary" });
        return withCORS(env, res, request);
      }

      // 그 외는 404
      return withCORS(
        env,
        json({ message: "Not Found", path: pathname }, { status: 404 }),
        request
      );
    } catch (e) {
      console.error(e);
      return withCORS(
        env,
        json({ message: "Not Found v2", path: pathname }, { status: 404 }),
        request
      );
    }
  },
};
