import { z } from "zod";
import { DEFAULT_MODEL } from "@/lib/ai-config";
import {
  FranceStudentAuthError,
  getAccountUser,
  loginWithPassword,
} from "@/lib/francestudent-auth";
import { writeFranceStudentSession } from "@/lib/francestudent-cookies";

const BodySchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

type Attempt = { count: number; resetAt: number };

const attempts = new Map<string, Attempt>();
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function isRateLimited(key: string) {
  const attempt = attempts.get(key);
  if (!attempt) return false;
  if (attempt.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return attempt.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const attempt = attempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  attempt.count += 1;
}

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(message: string, status: number, code?: string) {
  return Response.json(
    code ? { error: message, code } : { error: message },
    { status, headers: NO_STORE }
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Le corps de la requête n'est pas un JSON valide.", 400);
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Renseignez une adresse email valide et votre mot de passe France Student.",
      400
    );
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return errorResponse(
      "Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer.",
      429,
      "rate_limited"
    );
  }

  try {
    const session = await loginWithPassword(
      parsed.data.email,
      parsed.data.password
    );
    const user = await getAccountUser(session);

    await writeFranceStudentSession(session);
    attempts.delete(key);

    return Response.json(
      {
        ok: true,
        success: true,
        user,
        defaultModel: DEFAULT_MODEL,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    recordFailure(key);

    if (error instanceof FranceStudentAuthError) {
      return errorResponse(error.message, error.status, error.code);
    }

    return errorResponse(
      "La connexion à France Student a échoué. Réessayez dans un instant.",
      502,
      "unknown"
    );
  }
}
