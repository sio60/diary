// src/routes/profile.js
import { json } from "../utils/json.js";
import { verifyJwt } from "../lib/jwt.js";
import {
  sbSelectUserById,
  sbUpdateUserProfile,
} from "../lib/supabase.js";

function getBearer(request) {
  const h = request.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

const MBTI_LIST = new Set([
  "ISTJ","ISFJ","INFJ","INTJ",
  "ISTP","ISFP","INFP","INTP",
  "ESTP","ESFP","ENFP","ENTP",
  "ESTJ","ESFJ","ENFJ","ENTJ",
]);

function isDateString(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

// GET /profile
export async function getProfile(request, env) {
  const token = getBearer(request);
  if (!token) return json({ message: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = await verifyJwt(env, token);
  } catch {
    return json({ message: "Invalid token" }, { status: 401 });
  }

  const user = await sbSelectUserById(env, payload.sub);
  if (!user) return json({ message: "User not found" }, { status: 404 });

  return json({
    profile: {
      birth: user.birth,
      first_day: user.first_day,
      mbti: user.mbti || null,
    },
  });
}

// POST /profile
export async function upsertProfile(request, env) {
  const token = getBearer(request);
  if (!token) return json({ message: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = await verifyJwt(env, token);
  } catch {
    return json({ message: "Invalid token" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { birth, first_day, mbti } = body;

  const patch = {};

  if (birth !== undefined) {
    if (birth !== null && !isDateString(birth)) {
      return json(
        { message: "birth must be YYYY-MM-DD or null" },
        { status: 400 }
      );
    }
    patch.birth = birth;
  }

  if (first_day !== undefined) {
    if (first_day !== null && !isDateString(first_day)) {
      return json(
        { message: "first_day must be YYYY-MM-DD or null" },
        { status: 400 }
      );
    }
    patch.first_day = first_day;
  }

  if (mbti !== undefined) {
    const val = mbti ? String(mbti).toUpperCase() : null;
    if (val !== null && !MBTI_LIST.has(val)) {
      return json(
        { message: "mbti must be one of 16 types or null" },
        { status: 400 }
      );
    }
    patch.mbti = val;
  }

  const updated = await sbUpdateUserProfile(env, payload.sub, patch);

  return json({
    profile: {
      birth: updated.birth,
      first_day: updated.first_day,
      mbti: updated.mbti || null,
    },
  });
}
