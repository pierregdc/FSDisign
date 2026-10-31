import {
  activateRemoteRateLimitPowerUp,
  getRemoteRateLimitCredits,
  getRemoteUserUsage,
} from "@/lib/francestudent-auth";
import { readFranceStudentSession } from "@/lib/francestudent-cookies";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await readFranceStudentSession();

  if (!session) {
    // Valeurs par défaut basées sur ia.francestudent.org
    return Response.json(
      {
        connected: false,
        usage: {
          chatBudget: {
            usedPercent: 3,
            remainingPercent: 97,
            resetAt: new Date(Date.now() + 9 * 3600 * 1000 + 33 * 60 * 1000).toISOString(),
            accountingUncertain: true,
          },
          rateLimits: [
            {
              type: "audio_transcription",
              bucket: "transcription_audio",
              usedPercent: 0,
              remainingPercent: 100,
              used: 0,
              limit: 100,
            },
            {
              type: "web_search",
              bucket: "recherche_web",
              usedPercent: 1,
              remainingPercent: 99,
              used: 1,
              limit: 100,
            },
          ],
          rateLimitPowerUpActive: false,
        },
        credits: {
          availableCount: 0,
        },
      },
      { headers: NO_STORE }
    );
  }

  try {
    const [usage, credits] = await Promise.all([
      getRemoteUserUsage(session),
      getRemoteRateLimitCredits(session),
    ]);

    return Response.json(
      {
        connected: true,
        usage: usage ?? {
          chatBudget: {
            usedPercent: 0,
            remainingPercent: 100,
            resetAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
            accountingUncertain: true,
          },
          rateLimits: [],
          rateLimitPowerUpActive: false,
        },
        credits: credits ?? { availableCount: 0 },
      },
      { headers: NO_STORE }
    );
  } catch {
    return Response.json(
      {
        connected: true,
        usage: null,
        credits: { availableCount: 0 },
      },
      { headers: NO_STORE }
    );
  }
}

export async function POST() {
  const session = await readFranceStudentSession();

  if (!session) {
    return Response.json(
      { error: "Connexion à un compte France Student requise." },
      { status: 401, headers: NO_STORE }
    );
  }

  const success = await activateRemoteRateLimitPowerUp(session);
  return Response.json({ success }, { headers: NO_STORE });
}
