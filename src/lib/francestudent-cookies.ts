import { cookies } from "next/headers";
import type { FranceStudentSession } from "@/lib/francestudent-auth";

const SESSION_COOKIE = "fs_session_token";
const DEVICE_COOKIE = "fs_device_id";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function readFranceStudentSession(): Promise<FranceStudentSession | null> {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value?.trim();
  const deviceId = store.get(DEVICE_COOKIE)?.value?.trim();

  if (!sessionToken || !deviceId) return null;
  if (sessionToken.length > 500 || deviceId.length > 100) return null;

  return { sessionToken, deviceId };
}

export async function writeFranceStudentSession(session: FranceStudentSession) {
  const store = await cookies();
  const options = cookieOptions();
  store.set(SESSION_COOKIE, session.sessionToken, options);
  store.set(DEVICE_COOKIE, session.deviceId, options);
}

export async function clearFranceStudentSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(DEVICE_COOKIE);
}
