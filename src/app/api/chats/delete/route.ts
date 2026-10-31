import { z } from "zod";
import {
  deleteRemoteChat,
  FranceStudentAuthError,
} from "@/lib/francestudent-auth";
import {
  clearFranceStudentSession,
  readFranceStudentSession,
} from "@/lib/francestudent-cookies";

const BodySchema = z.object({
  chatId: z.string().uuid(),
});

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête n'est pas un JSON valide." },
      { status: 400, headers: NO_STORE }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Identifiant de conversation invalide." },
      { status: 400, headers: NO_STORE }
    );
  }

  const session = await readFranceStudentSession();
  if (!session) {
    return Response.json(
      { error: "Aucune session France Student active." },
      { status: 401, headers: NO_STORE }
    );
  }

  try {
    await deleteRemoteChat(session, parsed.data.chatId);
    return Response.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    if (
      error instanceof FranceStudentAuthError &&
      error.code === "session_expired"
    ) {
      await clearFranceStudentSession();
      return Response.json(
        {
          error: "Votre session France Student a expiré.",
          code: "session_expired",
        },
        { status: 401, headers: NO_STORE }
      );
    }

    return Response.json(
      { error: "La conversation n'a pas pu être supprimée." },
      { status: 502, headers: NO_STORE }
    );
  }
}
