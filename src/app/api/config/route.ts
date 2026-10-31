import { connection } from "next/server";
import { getPublicAiConfig } from "@/lib/ai-config";

export async function GET() {
  // Les variables d'environnement sont lues à chaque requête, pas au build.
  await connection();

  return Response.json(getPublicAiConfig(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
