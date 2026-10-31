import { z } from "zod";
import {
  createRemoteProject,
  deleteRemoteProject,
  FranceStudentAuthError,
  listRemoteProjects,
} from "@/lib/francestudent-auth";
import {
  clearFranceStudentSession,
  readFranceStudentSession,
} from "@/lib/francestudent-cookies";

const NO_STORE = { "Cache-Control": "no-store" };

const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Le nom du projet est requis.").max(255),
  customInstructions: z.string().trim().max(10000).optional(),
});

const DeleteProjectSchema = z.object({
  projectId: z.string().min(1, "L'identifiant du projet est requis."),
});

export async function GET() {
  const session = await readFranceStudentSession();

  if (!session) {
    return Response.json(
      {
        connected: false,
        mode: "local",
        projects: [],
      },
      { headers: NO_STORE }
    );
  }

  try {
    const projects = await listRemoteProjects(session);
    return Response.json(
      {
        connected: true,
        mode: "account",
        projects,
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
        {
          connected: false,
          mode: "local",
          projects: [],
          error: "Votre session France Student a expiré.",
          code: "session_expired",
        },
        { status: 401, headers: NO_STORE }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de récupérer les projets France Student.";
    return Response.json(
      {
        connected: true,
        mode: "account",
        projects: [],
        error: message,
      },
      { status: 502, headers: NO_STORE }
    );
  }
}

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

  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Données de projet invalides." },
      { status: 400, headers: NO_STORE }
    );
  }

  const session = await readFranceStudentSession();

  if (!session) {
    // Mode local si aucun compte n'est connecté
    const localProject = {
      id: `local_proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: parsed.data.name,
      customInstructions: parsed.data.customInstructions || "",
      createdAt: new Date().toISOString(),
      isLocal: true,
    };
    return Response.json(
      {
        project: localProject,
        mode: "local",
        connected: false,
      },
      { headers: NO_STORE }
    );
  }

  try {
    const project = await createRemoteProject(session, {
      name: parsed.data.name,
      customInstructions: parsed.data.customInstructions,
    });

    return Response.json(
      {
        project,
        mode: "account",
        connected: true,
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
        {
          error: "Votre session France Student a expiré.",
          code: "session_expired",
        },
        { status: 401, headers: NO_STORE }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de créer le projet sur France Student.";
    return Response.json({ error: message }, { status: 502, headers: NO_STORE });
  }
}

export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête n'est pas un JSON valide." },
      { status: 400, headers: NO_STORE }
    );
  }

  const parsed = DeleteProjectSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Identifiant de projet invalide." },
      { status: 400, headers: NO_STORE }
    );
  }

  const session = await readFranceStudentSession();

  if (!session) {
    return Response.json({ ok: true, mode: "local" }, { headers: NO_STORE });
  }

  try {
    await deleteRemoteProject(session, parsed.data.projectId);
    return Response.json({ ok: true, mode: "account" }, { headers: NO_STORE });
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
      { error: "Impossible de supprimer le projet." },
      { status: 502, headers: NO_STORE }
    );
  }
}
