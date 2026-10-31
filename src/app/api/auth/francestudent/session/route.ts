import { connection } from "next/server";
import { DEFAULT_MODEL } from "@/lib/ai-config";
import {
  FranceStudentAuthError,
  getAccountUser,
} from "@/lib/francestudent-auth";
import {
  clearFranceStudentSession,
  readFranceStudentSession,
} from "@/lib/francestudent-cookies";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  await connection();

  const session = await readFranceStudentSession();
  if (!session) {
    return Response.json({ connected: false }, { headers: NO_STORE });
  }

  try {
    const user = await getAccountUser(session);
    return Response.json(
      {
        connected: true,
        user,
        defaultModel: DEFAULT_MODEL,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    if (
      error instanceof FranceStudentAuthError &&
      error.code === "session_expired"
    ) {
      await clearFranceStudentSession();
      return Response.json(
        { connected: false, expired: true },
        { headers: NO_STORE }
      );
    }

    // La session existe mais France Student est momentanément injoignable.
    // On la conserve : le prochain message tentera de renouveler le jeton.
    return Response.json(
      {
        connected: true,
        user: {
          name: "Compte France Student",
          email: "",
          avatar: null,
        },
        defaultModel: DEFAULT_MODEL,
        warning:
          "Impossible de vérifier votre compte pour le moment. La connexion sera retentée à l'envoi d'un message.",
      },
      { headers: NO_STORE }
    );
  }
}
