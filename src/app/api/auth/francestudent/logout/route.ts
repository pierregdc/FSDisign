import { clearFranceStudentSession } from "@/lib/francestudent-cookies";

export async function POST() {
  await clearFranceStudentSession();
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
