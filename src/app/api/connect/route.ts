import { z } from "zod";
import { getAiConfig } from "@/lib/ai-config";
import { testConnection, UpstreamError } from "@/lib/ai-upstream";

const BodySchema = z.object({
  apiKey: z.string().trim().min(1).max(500),
  model: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête n'est pas un JSON valide." },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Renseignez une clé API et un modèle valides." },
      { status: 400 }
    );
  }

  const config = getAiConfig({
    apiKey: parsed.data.apiKey,
    model: parsed.data.model,
  });

  if (config.source !== "client") {
    return Response.json(
      { error: "La clé API fournie n’est pas valide. Vérifiez-la et réessayez." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (config.model !== parsed.data.model) {
    return Response.json(
      { error: "L’identifiant du modèle n’est pas valide." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await testConnection(config);
    return Response.json(
      { ok: true, model: config.model },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message =
      error instanceof UpstreamError
        ? error.message
        : "Impossible de vérifier la clé auprès de France Student. Vérifiez votre connexion.";

    return Response.json(
      { error: message },
      {
        status: error instanceof UpstreamError ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
