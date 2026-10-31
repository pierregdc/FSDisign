"use client";

import {
  ArrowUpRight,
  Award,
  BookOpen,
  ClipboardList,
  GitBranch,
  LayoutTemplate,
  LogIn,
  Palette,
  Settings2,
} from "lucide-react";
import type { AiMode, ClientAiSession, PublicAiConfig } from "@/lib/ai-config";
import { SITE } from "@/lib/site";
import { BrandMark } from "@/features/chat/brand";

const suggestions = [
  {
    icon: BookOpen,
    tint: "text-accent",
    background: "bg-accent/10",
    title: "Fiche méthode",
    description: "Structure claire, étapes clés et méthode de travail",
    prompt: "Fais une fiche méthode sur ",
  },
  {
    icon: GitBranch,
    tint: "text-violet-500",
    background: "bg-violet-500/10",
    title: "Carte mentale",
    description: "Nœuds, branches et concepts interconnectés",
    prompt: "Crée une carte mentale sur ",
  },
  {
    icon: LayoutTemplate,
    tint: "text-sky-500",
    background: "bg-sky-500/10",
    title: "Maquette d'interface",
    description: "Prototypes interactifs multi-écrans",
    prompt: "Crée une maquette d'interface interactive pour ",
  },
  {
    icon: Award,
    tint: "text-amber-500",
    background: "bg-amber-500/10",
    title: "Quiz QCM",
    description: "Questionnaire interactif avec explications",
    prompt: "Crée un questionnaire interactif QCM de 4 questions sur ",
  },
  {
    icon: Palette,
    tint: "text-emerald-500",
    background: "bg-emerald-500/10",
    title: "Graphisme SVG",
    description: "Illustrations vectorielles et graphismes propres",
    prompt: "Génère une illustration vectorielle SVG propre de ",
  },
  {
    icon: ClipboardList,
    tint: "text-rose-500",
    background: "bg-rose-500/10",
    title: "Checklist d'organisation",
    description: "Liste de tâches et étapes séquentielles",
    prompt: "Crée une checklist d'organisation pour ",
  },
];

export function EmptyState({
  onPrompt,
  onDraftPrompt,
  onOpenSettings,
  config,
  session,
  mode,
  model,
}: {
  onPrompt?: (prompt: string) => void;
  onDraftPrompt?: (prompt: string) => void;
  onOpenSettings: () => void;
  config: PublicAiConfig | null;
  session: ClientAiSession | null;
  mode: AiMode;
  model: string;
}) {
  const isLive = mode === "live";

  const handleSelect = (promptBase: string) => {
    if (onDraftPrompt) {
      onDraftPrompt(promptBase);
    } else if (onPrompt) {
      onPrompt(promptBase);
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-start px-4 py-6 sm:justify-center sm:px-8 sm:py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <BrandMark size="md" className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-xs" />
        </div>

        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-card/60 px-3 py-0.5 text-[11px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            France Student · Studio Visuel
          </span>
        </div>

        <h1 className="max-w-2xl text-balance text-2xl font-bold tracking-tight text-ink sm:text-[2.1rem] sm:leading-[1.18]">
          Posez une question.{" "}
          <span className="text-accent">
            Obtenez l’interface.
          </span>
        </h1>

        <p className="mt-2.5 max-w-lg text-pretty text-xs leading-relaxed text-muted sm:text-[13px]">
          Choisissez une suggestion ci-dessous pour insérer la base du prompt et compléter votre thème, ou écrivez directement votre demande.
        </p>

        {!isLive ? (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-accent-strong hover:shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              Se connecter avec France Student
            </button>
            <p className="text-[11px] text-faint">
              Compte officiel ou clé API pour activer les modèles IA
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-3.5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3.5 py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/15"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            {session?.kind === "account"
              ? `Compte France Student · ${model}`
              : `Accès actif · ${model}`}
            <Settings2 className="h-3 w-3 opacity-60" />
          </button>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;

          return (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => handleSelect(suggestion.prompt)}
              title={`Insérer : "${suggestion.prompt}..."`}
              className="group flex flex-col items-start gap-2 rounded-xl border border-line/60 bg-card/60 p-3.5 text-left transition-all hover:border-accent/30 hover:bg-card hover:shadow-xs hover:-translate-y-0.5"
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${suggestion.background} transition-transform group-hover:scale-105`}
                >
                  <Icon className={`h-4 w-4 ${suggestion.tint}`} />
                </span>
                <span className="text-[10px] font-medium text-accent opacity-75 group-hover:opacity-100 flex items-center gap-0.5">
                  Compléter
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                  {suggestion.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted line-clamp-2">
                  {suggestion.description}
                </span>
                <span className="mt-1.5 inline-block text-[10px] font-mono text-faint bg-ink/[0.03] px-1.5 py-0.5 rounded border border-line/50">
                  {suggestion.prompt}…
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-faint">
        <button
          type="button"
          onClick={() => handleSelect("Fais une fiche de révision sur ")}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ClipboardList className="h-3 w-3 text-faint" />
          <span>Fiche de révision…</span>
        </button>

        <a
          href={SITE.offerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <span>Offre IA</span>
          <ArrowUpRight className="h-2.5 w-2.5 opacity-50" />
        </a>
      </div>
    </div>
  );
}
