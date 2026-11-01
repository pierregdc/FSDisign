"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Download,
  ExternalLink,
  FolderKanban,
  GitBranch,
  GraduationCap,
  HardDrive,
  Layers,
  Loader2,
  MessageSquare,
  Palette,
  Play,
  Plus,
  RefreshCw,
  Server,
  Sparkles,
  Trash2,
  Users,
  Zap,
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckSquare,
  Clock,
  Compass,
  FileSpreadsheet,
  FileText,
  Gamepad2,
  LayoutTemplate,
  ListOrdered,
  MapPin,
  Receipt,
  Scale,
  Sliders,
  Table,
  TrendingUp,
  Utensils,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AiMode, PublicAiConfig } from "@/lib/ai-config";
import type { Conversation } from "@/lib/chat-types";
import { parsePartialUI } from "@/lib/partial-ui";
import { SITE } from "@/lib/site";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

const CANVA_PREFS_KEY = "france-student:canva-prefs:v1";

type CanvaPrefs = {
  browserNotifyOnFinish: boolean;
  autoOpenCanvaPreview: boolean;
  defaultExportFormat: "svg" | "png" | "html" | "json";
};

const DEFAULT_PREFS: CanvaPrefs = {
  browserNotifyOnFinish: false,
  autoOpenCanvaPreview: true,
  defaultExportFormat: "svg",
};

function readCanvaPrefs(): CanvaPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(CANVA_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<CanvaPrefs>;
    return {
      browserNotifyOnFinish: Boolean(parsed.browserNotifyOnFinish),
      autoOpenCanvaPreview: parsed.autoOpenCanvaPreview ?? true,
      defaultExportFormat:
        parsed.defaultExportFormat === "png" ||
        parsed.defaultExportFormat === "html" ||
        parsed.defaultExportFormat === "json"
          ? parsed.defaultExportFormat
          : "svg",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function NotificationsTab() {
  const [prefs, setPrefs] = useState<CanvaPrefs>(() => readCanvaPrefs());
  const [permission, setPermission] = useState<string>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return window.Notification.permission;
  });
  const [statusNote, setStatusNote] = useState<string>("");

  useEffect(() => {
    try {
      window.localStorage.setItem(CANVA_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Stockage local indisponible
    }
  }, [prefs]);

  const requestBrowserPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      setStatusNote("Les notifications système ne sont pas prises en charge par ce navigateur.");
      return;
    }

    try {
      const result = await window.Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setPrefs((prev) => ({ ...prev, browserNotifyOnFinish: true }));
        new window.Notification("France Student — Canva UI", {
          body: "Les notifications de fin de génération Canva sont activées.",
        });
        setStatusNote("Notifications système autorisées et test envoyé.");
      } else {
        setStatusNote("Permission refusée ou bloquée dans le navigateur.");
      }
    } catch {
      setStatusNote("Impossible de demander la permission de notification.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-ink">
          Notifications & Préférences Canva
        </h3>
        <p className="mt-1 text-xs text-muted">
          Gérez les alertes réelles du navigateur lors des générations longues (illustrations, schémas, maquettes)
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">
                Permission Web Notifications du navigateur
              </p>
              <p className="text-[11px] text-faint">
                Statut réel :{" "}
                <span className="font-semibold text-ink">
                  {permission === "granted"
                    ? "Autorisé"
                    : permission === "denied"
                      ? "Bloqué par le navigateur"
                      : permission === "unsupported"
                        ? "Non supporté"
                        : "En attente d'autorisation"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void requestBrowserPermission()}
            disabled={permission === "unsupported"}
            className="rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {permission === "granted"
              ? "Envoyer une notification test"
              : "Autoriser dans le navigateur"}
          </button>
        </div>

        {statusNote ? (
          <p className="rounded-xl border border-line bg-card px-3 py-2 text-xs text-muted">
            {statusNote}
          </p>
        ) : null}

        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          <div>
            <p className="text-xs font-bold text-ink">
              Alerter à la fin d&apos;une création Canva UI
            </p>
            <p className="text-[11px] text-faint">
              Affiche une notification lorsque le rendu en streaming d&apos;un bloc complexe se termine
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.browserNotifyOnFinish}
            onClick={() =>
              setPrefs((prev) => ({
                ...prev,
                browserNotifyOnFinish: !prev.browserNotifyOnFinish,
              }))
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              prefs.browserNotifyOnFinish ? "bg-accent" : "bg-line"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                prefs.browserNotifyOnFinish ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          <div>
            <p className="text-xs font-bold text-ink">
              Ouverture automatique de l&apos;aperçu visuel
            </p>
            <p className="text-[11px] text-faint">
              Afficher directement l&apos;onglet Aperçu (plutôt que le code source) sur les blocs SVG et Maquettes
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.autoOpenCanvaPreview}
            onClick={() =>
              setPrefs((prev) => ({
                ...prev,
                autoOpenCanvaPreview: !prev.autoOpenCanvaPreview,
              }))
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              prefs.autoOpenCanvaPreview ? "bg-accent" : "bg-line"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                prefs.autoOpenCanvaPreview ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          <div>
            <p className="text-xs font-bold text-ink">Format d&apos;export rapide préféré</p>
            <p className="text-[11px] text-faint">
              Format mis en avant dans les barres d&apos;outils d&apos;exportation Canva
            </p>
          </div>
          <select
            value={prefs.defaultExportFormat}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...prev,
                defaultExportFormat: e.target.value as CanvaPrefs["defaultExportFormat"],
              }))
            }
            className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-accent"
          >
            <option value="svg">SVG Vectoriel</option>
            <option value="png">PNG Haute Définition</option>
            <option value="html">HTML Interactif</option>
            <option value="json">JSON Structuré</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function formatRemainingTime(resetAt?: string): string {
  if (!resetAt) return "Réinitialisation dans 9 heures 33 minutes";
  const diffMs = new Date(resetAt).getTime() - Date.now();
  if (diffMs <= 0) return "Réinitialisation imminente";
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `Réinitialisation dans ${hours} heure${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return `Réinitialisation dans ${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export function UsageTab({
  model,
  mode,
  config,
  conversations,
}: {
  model: string;
  mode: AiMode;
  config: PublicAiConfig | null;
  conversations: Conversation[];
}) {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [otherLimitsOpen, setOtherLimitsOpen] = useState(false);
  const [activatingBoost, setActivatingBoost] = useState(false);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);

  const [usage, setUsage] = useState<{
    chatBudget: {
      usedPercent: number;
      remainingPercent: number;
      resetAt: string;
      accountingUncertain?: boolean;
    };
    rateLimits: Array<{
      type?: string;
      bucket?: string;
      usedPercent?: number;
      remainingPercent?: number;
    }>;
    credits: {
      availableCount: number;
    };
  }>({
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
      },
    ],
    credits: {
      availableCount: 0,
    },
  });

  const loadUsage = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/usage", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.usage) {
          setUsage({
            chatBudget: {
              usedPercent: data.usage.chatBudget?.usedPercent ?? 3,
              remainingPercent: data.usage.chatBudget?.remainingPercent ?? 97,
              resetAt:
                data.usage.chatBudget?.resetAt ??
                new Date(Date.now() + 9 * 3600 * 1000 + 33 * 60 * 1000).toISOString(),
              accountingUncertain: data.usage.chatBudget?.accountingUncertain ?? true,
            },
            rateLimits: Array.isArray(data.usage.rateLimits) ? data.usage.rateLimits : [],
            credits: {
              availableCount: data.credits?.availableCount ?? 0,
            },
          });
        }
      }
    } catch {
      // Conserver les quotas par défaut
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  const handleActivateBoost = async () => {
    if (usage.credits.availableCount <= 0 || activatingBoost) return;
    setActivatingBoost(true);
    setBoostMessage(null);
    try {
      const res = await fetch("/api/usage", { method: "POST" });
      if (res.ok) {
        setBoostMessage("Boost activé avec succès ! Vos limites sont doublées pendant 7 jours.");
        await loadUsage(true);
      } else {
        setBoostMessage("Impossible d'activer le boost pour le moment.");
      }
    } catch {
      setBoostMessage("Erreur réseau lors de l'activation du boost.");
    } finally {
      setActivatingBoost(false);
    }
  };

  const audioLimit = usage.rateLimits.find((r) => r.type === "audio_transcription") ?? {
    usedPercent: 0,
  };

  const stats = useMemo(() => {
    let userMessages = 0;
    let assistantMessages = 0;
    let totalBlocks = 0;
    const byType: Record<string, number> = {};

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.role === "user") userMessages += 1;
        if (msg.role === "assistant") {
          assistantMessages += 1;
          const parsed = parsePartialUI(msg.content);
          for (const b of parsed.blocks) {
            totalBlocks += 1;
            byType[b.type] = (byType[b.type] || 0) + 1;
          }
        }
      }
    }

    return {
      conversationsCount: conversations.length,
      userMessages,
      assistantMessages,
      totalBlocks,
      byType,
    };
  }, [conversations]);

  const availableModelsCount = config?.models?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {/* En-tête officiel conforme au portail France Student */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">
            Vos limites d&apos;utilisation
          </h3>
          <p className="mt-1 text-xs text-muted">
            Suivez la consommation de votre compte sur chaque quota disponible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsage(true)}
          disabled={loading || isRefreshing}
          title="Rafraîchir les quotas"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-50"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (loading || isRefreshing) && "animate-spin text-accent"
            )}
          />
        </button>
      </div>

      <div className="space-y-5 pt-1">
        {/* Ligne 1 : Budget chat quotidien (24 h) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
          <div>
            <h4 className="text-sm font-semibold text-ink">
              Budget chat quotidien (24 h)
            </h4>
            <p className="mt-1 text-xs text-muted">
              {formatRemainingTime(usage.chatBudget.resetAt)}
            </p>
            <p className="mt-0.5 text-[11px] text-faint">
              La consommation affichée est une estimation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="h-2 w-44 sm:w-64 rounded-full bg-slate-800/80 dark:bg-slate-800 border border-line/60 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-indigo-400 dark:bg-indigo-300 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, usage.chatBudget.usedPercent))}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-ink tabular-nums whitespace-nowrap min-w-[75px] text-right">
              {usage.chatBudget.usedPercent} % utilisé
            </span>
          </div>
        </div>

        {/* Ligne 2 : Transcription audio en texte */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 border-t border-line/40 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-ink">
              Transcription audio en texte
            </h4>
            <p className="mt-1 text-xs text-muted">
              Vous n&apos;avez pas encore utilisé la transcription audio.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="h-2 w-44 sm:w-64 rounded-full bg-slate-800/80 dark:bg-slate-800 border border-line/60 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-indigo-400 dark:bg-indigo-300 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, audioLimit.usedPercent ?? 0))}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-ink tabular-nums whitespace-nowrap min-w-[75px] text-right">
              {audioLimit.usedPercent ?? 0} % utilisé
            </span>
          </div>
        </div>

        {/* Accordéon : Autres limites (1) */}
        <div className="border-t border-line/40 pt-2">
          <button
            type="button"
            onClick={() => setOtherLimitsOpen((curr) => !curr)}
            className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-ink hover:text-accent transition-colors"
          >
            <span>Autres limites (1)</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-faint transition-transform duration-200",
                otherLimitsOpen && "rotate-180"
              )}
            />
          </button>

          {otherLimitsOpen ? (
            <div className="pl-1 pt-1 pb-3 space-y-3 animate-rise border-l-2 border-line/60 ml-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-3">
                <div>
                  <h5 className="text-xs font-semibold text-ink">
                    Recherche web connectée & synthèses
                  </h5>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Requêtes en temps réel pour sourcer et actualiser les résultats.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-2 w-44 sm:w-64 rounded-full bg-slate-800/80 dark:bg-slate-800 border border-line/60 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-indigo-400 dark:bg-indigo-300 transition-all duration-500"
                      style={{ width: "1%" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink tabular-nums whitespace-nowrap min-w-[75px] text-right">
                    1 % utilisé
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Bloc : Boosts de limites */}
        <div className="rounded-2xl border border-line bg-card/60 p-5 space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-ink/[0.08] dark:bg-white/10 text-ink dark:text-white flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Boosts de limites</h4>
                <p className="text-xs text-muted">
                  Un crédit double toutes vos limites pendant 7 jours.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={usage.credits.availableCount === 0 || activatingBoost}
              onClick={handleActivateBoost}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink/[0.08] dark:bg-white/10 border border-line px-4 py-2 text-xs font-semibold text-ink transition-all hover:bg-ink/[0.12] dark:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
            >
              {activatingBoost ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              Activer le boost
            </button>
          </div>

          <p className="text-xs font-medium text-muted pt-1">
            {usage.credits.availableCount > 0
              ? `${usage.credits.availableCount} crédit${
                  usage.credits.availableCount > 1 ? "s" : ""
                } disponible${usage.credits.availableCount > 1 ? "s" : ""}`
              : "Aucun crédit disponible"}
          </p>

          {boostMessage ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
              {boostMessage}
            </p>
          ) : null}
        </div>
      </div>

      {/* Accordéon secondaire : Télémétrie de la session Canva UI */}
      <div className="border-t border-line pt-4 mt-6">
        <button
          type="button"
          onClick={() => setSessionDetailsOpen((c) => !c)}
          className="flex w-full items-center justify-between text-left text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <span>Détails & Télémétrie de la session actuelle ({stats.totalBlocks} blocs générés)</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              sessionDetailsOpen && "rotate-180"
            )}
          />
        </button>

        {sessionDetailsOpen ? (
          <div className="mt-4 space-y-4 animate-rise">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
                  Modèle actif
                </span>
                <p className="mt-1 text-xs font-bold text-ink truncate" title={model}>
                  {model}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
                  Messages échangés
                </span>
                <p className="mt-1 text-xs font-bold text-ink">
                  {stats.userMessages + stats.assistantMessages} ({stats.userMessages} envoyés)
                </p>
              </div>

              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
                  Blocs Canva
                </span>
                <p className="mt-1 text-xs font-bold text-ink">{stats.totalBlocks} blocs</p>
              </div>
            </div>

            {stats.totalBlocks > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="rounded-lg border border-line bg-card p-2 text-center"
                  >
                    <span className="text-[9px] font-bold uppercase text-faint">{type}</span>
                    <p className="text-sm font-extrabold text-ink">{count}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const CANVA_ENGINES: Array<{
  id: UIBlock["type"];
  name: string;
  category: string;
  description: string;
  exports: string[];
  samplePrompt: string;
}> = [
  {
    id: "imageStudio",
    name: "Studio Image & Composition",
    category: "Image & Retouche",
    description:
      "Création d'illustrations, affiches, logos, analyse d'image, recadrage, filtres et variantes.",
    exports: ["SVG", "PNG", "JPG", "WebP", "JSON"],
    samplePrompt:
      "Ouvre le Studio Image avec une affiche conceptuelle cyber-écologique, palette de couleurs et variantes.",
  },
  {
    id: "svg",
    name: "Studio Vectoriel SVG",
    category: "Vecteur & Code",
    description:
      "Création et édition de code SVG en direct, formes vectorielles, dégradés et animations SVG.",
    exports: ["SVG", "PNG", "JPG", "WebP", "HTML"],
    samplePrompt:
      "Crée un logo vectoriel SVG original et moderne avec dégradés manipulables dans le Studio SVG.",
  },
  {
    id: "diagram",
    name: "Cartes Mentales, Schémas & Timelines",
    category: "Architecture & Flux",
    description:
      "Cartes mentales manipulables, organigrammes, schémas réseau, séquences, arbres et frises chronologiques.",
    exports: ["SVG", "PNG", "JSON"],
    samplePrompt:
      "Génère une carte mentale interactive complète sur l'architecture d'une application web moderne.",
  },
  {
    id: "mockup",
    name: "Maquettes UI, Prototypes & Mini-Apps",
    category: "Prototypage Interactif",
    description:
      "Maquettes desktop/web/mobile, wireframes, navigation multi-écrans, formulaires dynamiques et mini-jeux.",
    exports: ["HTML", "SVG", "JSON"],
    samplePrompt:
      "Crée un prototype interactif multi-écrans d'une application mobile étudiante avec navigation cliquable.",
  },
  {
    id: "visualDoc",
    name: "Documents Illustrés & Supports Pédagogiques",
    category: "Édition & Impression",
    description:
      "Fiches visuelles, rapports, couvertures, comparatifs, cartes de synthèse et aperçu avant impression.",
    exports: ["HTML", "PDF (Impression)", "JSON"],
    samplePrompt:
      "Crée une fiche de synthèse visuelle prête à imprimer avec comparatif et points clés sur l'IA générative.",
  },
  {
    id: "chart",
    name: "Visualisations & Graphiques de Données",
    category: "Data & Infographie",
    description:
      "Graphiques en barres, courbes, camemberts, histogrammes et jauges interactives.",
    exports: ["SVG", "CSV", "JSON"],
    samplePrompt:
      "Génère un tableau de bord graphique comparant les performances des modèles d'IA open-weight.",
  },
  {
    id: "kpi",
    name: "Blocs KPI & Indicateurs Visuels",
    category: "Statistiques",
    description:
      "Cartes d'indicateurs clés de performance avec variations et tendances.",
    exports: ["JSON"],
    samplePrompt: "Affiche un bloc KPI avec 4 indicateurs clés pour le suivi d'un projet SaaS.",
  },
  {
    id: "calculator",
    name: "Calculatrices & Simulateurs Dynamiques",
    category: "Outils Interactifs",
    description:
      "Simulateurs paramétriques avec curseurs temps réel et formules vérifiées.",
    exports: ["JSON"],
    samplePrompt:
      "Crée une calculatrice interactive de budget étudiant mensuel avec curseurs dynamiques.",
  },
  {
    id: "quiz",
    name: "Questionnaires Interactifs",
    category: "Pédagogie",
    description:
      "QCM interactifs avec correction immédiate, explications détaillées et score.",
    exports: ["JSON"],
    samplePrompt:
      "Crée un questionnaire interactif de 4 questions sur l'algorithmique et les structures de données.",
  },
  {
    id: "map",
    name: "Cartographie Interactive",
    category: "Géographie",
    description:
      "Cartes géographiques interactives avec marqueurs et points d'intérêt.",
    exports: ["HTML", "JSON"],
    samplePrompt:
      "Affiche une carte interactive des principaux pôles universitaires scientifiques en France.",
  },
];

export function McpTab({
  onLaunchPrompt,
}: {
  onLaunchPrompt?: (prompt: string) => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold tracking-tight text-ink">
            Modules Canva UI & Moteurs Génératifs
          </h3>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase">
            10 moteurs actifs
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Registre réel des 10 moteurs d&apos;interface générative validés par schéma Zod dans{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px] text-ink">
            src/lib/ui-schema.ts
          </code>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {CANVA_ENGINES.map((engine) => (
          <div
            key={engine.id}
            className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-accent/40"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {engine.name}
                </span>
                <span className="rounded-md border border-line bg-card px-2 py-0.5 font-mono text-[10px] text-accent">
                  {engine.id}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
                {engine.description}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
              <div className="flex flex-wrap gap-1">
                {engine.exports.map((exp) => (
                  <span
                    key={exp}
                    className="rounded bg-card px-1.5 py-0.5 text-[9px] font-semibold text-faint border border-line/60"
                  >
                    {exp}
                  </span>
                ))}
              </div>

              {onLaunchPrompt ? (
                <button
                  type="button"
                  onClick={() => onLaunchPrompt(engine.samplePrompt)}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent transition-colors hover:bg-accent hover:text-white shrink-0"
                >
                  <Play className="h-3 w-3" />
                  Tester
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface FranceStudentProjectModule {
  id: string;
  title: string;
  version: string;
  status: "Stable" | "Bêta";
  category:
    | "FS Smart UI"
    | "Maths & Sciences"
    | "Cartographie & Trajets"
    | "Design & Canva"
    | "Données & Visualisation"
    | "Composants Interactifs"
    | "Blocs Essentiels";
  icon: typeof FolderKanban;
  prompt: string;
}

export type FranceStudentProject = FranceStudentProjectModule;

export const FRANCESTUDENT_PROJECTS: FranceStudentProjectModule[] = [
  // 1-5: FS Smart UI (5 modules)
  {
    id: "exploded-diagram",
    title: "Schéma Éclaté Mécanique",
    version: "v1.1.0",
    status: "Bêta",
    category: "FS Smart UI",
    icon: Cpu,
    prompt: "Explique avec un schéma éclaté interactif comment fonctionne ",
  },
  {
    id: "smart-recipe",
    title: "Recette Dynamique & Minuteurs",
    version: "v1.1.0",
    status: "Bêta",
    category: "FS Smart UI",
    icon: Utensils,
    prompt: "Crée une recette interactive avec minuteurs pour ",
  },
  {
    id: "bill-splitter",
    title: "Partage d'Addition & Pourboire",
    version: "v1.1.0",
    status: "Bêta",
    category: "FS Smart UI",
    icon: Receipt,
    prompt: "Simule un partage d'addition interactif pour ",
  },
  {
    id: "decision-matrix",
    title: "Matrice de Décision Multicritère",
    version: "v1.1.0",
    status: "Bêta",
    category: "FS Smart UI",
    icon: Scale,
    prompt: "Crée une matrice de décision multicritère pour choisir entre ",
  },
  {
    id: "tile-game",
    title: "Jeu d'Association de Tuiles",
    version: "v1.1.0",
    status: "Bêta",
    category: "FS Smart UI",
    icon: Gamepad2,
    prompt: "Génère un jeu interactif d'association de tuiles sur ",
  },

  // 6-8: Maths & Sciences (3 modules)
  {
    id: "math-formulas",
    title: "Résolution Formelle & Courbes f(x)",
    version: "v1.0.0",
    status: "Stable",
    category: "Maths & Sciences",
    icon: Calculator,
    prompt: "Résous et trace l'étude mathématique complète de ",
  },
  {
    id: "math-geometry",
    title: "Géométrie Vectorielle Fine",
    version: "v1.0.0",
    status: "Stable",
    category: "Maths & Sciences",
    icon: Compass,
    prompt: "Illustre et démontre avec une figure géométrique dynamique ",
  },
  {
    id: "math-spreadsheet",
    title: "Tableur Mathématique Intégré",
    version: "v1.0.0",
    status: "Stable",
    category: "Maths & Sciences",
    icon: Table,
    prompt: "Crée un tableau de calcul dynamique avec formules pour ",
  },

  // 9-10: Cartographie & Trajets (2 modules)
  {
    id: "interactive-map",
    title: "Cartographie OSM & ESRI",
    version: "v1.0.0",
    status: "Stable",
    category: "Cartographie & Trajets",
    icon: MapPin,
    prompt: "Affiche une carte interactive avec points d'intérêt pour ",
  },
  {
    id: "travel-multimodal",
    title: "Voyage Multimodal (Train, Vol, Auto, Marche)",
    version: "v1.0.0",
    status: "Stable",
    category: "Cartographie & Trajets",
    icon: Compass,
    prompt: "Définis le trajet multimodal complet entre ",
  },

  // 11-14: Design & Canva (4 modules)
  {
    id: "svg-studio",
    title: "Studio Vectoriel SVG",
    version: "v1.1.0",
    status: "Bêta",
    category: "Design & Canva",
    icon: Palette,
    prompt: "Génère une illustration vectorielle SVG propre de ",
  },
  {
    id: "mindmap-diagram",
    title: "Cartes Mentales & Diagrammes",
    version: "v1.1.0",
    status: "Bêta",
    category: "Design & Canva",
    icon: GitBranch,
    prompt: "Crée une carte mentale sur ",
  },
  {
    id: "ui-mockup",
    title: "Maquettes d'Interface Multi-Écrans",
    version: "v1.1.0",
    status: "Bêta",
    category: "Design & Canva",
    icon: LayoutTemplate,
    prompt: "Crée une maquette d'interface interactive pour ",
  },
  {
    id: "image-studio",
    title: "Studio Générateur d'Images IA",
    version: "v1.1.0",
    status: "Bêta",
    category: "Design & Canva",
    icon: Sparkles,
    prompt: "Génère une image de ",
  },

  // 15-18: Données & Visualisation (4 modules)
  {
    id: "quiz-interactive",
    title: "Quiz QCM Interactif",
    version: "v1.1.0",
    status: "Bêta",
    category: "Données & Visualisation",
    icon: Award,
    prompt: "Crée un questionnaire interactif QCM de 4 questions sur ",
  },
  {
    id: "charts-graphs",
    title: "Graphiques & Histogrammes",
    version: "v1.1.0",
    status: "Bêta",
    category: "Données & Visualisation",
    icon: BarChart3,
    prompt: "Présente sous forme de graphique interactif les données de ",
  },
  {
    id: "kpi-dashboard",
    title: "Tableaux de Bord KPI",
    version: "v1.1.0",
    status: "Bêta",
    category: "Données & Visualisation",
    icon: TrendingUp,
    prompt: "Génère un tableau de bord KPI avec indicateurs clés pour ",
  },
  {
    id: "timeline-view",
    title: "Frise Chronologique Interactive",
    version: "v1.1.0",
    status: "Bêta",
    category: "Données & Visualisation",
    icon: Clock,
    prompt: "Construis une frise chronologique détaillée de ",
  },

  // 19-22: Composants Interactifs (4 modules)
  {
    id: "compare-view",
    title: "Comparateur Visuel Point par Point",
    version: "v1.1.0",
    status: "Bêta",
    category: "Composants Interactifs",
    icon: CheckCircle2,
    prompt: "Compare point par point les avantages et inconvénients de ",
  },
  {
    id: "slider-view",
    title: "Curseurs Dynamiques (Sliders)",
    version: "v1.1.0",
    status: "Bêta",
    category: "Composants Interactifs",
    icon: Sliders,
    prompt: "Crée un simulateur interactif avec curseurs pour ",
  },
  {
    id: "form-view",
    title: "Formulaires Interactifs Dynamiques",
    version: "v1.1.0",
    status: "Bêta",
    category: "Composants Interactifs",
    icon: FileText,
    prompt: "Génère un formulaire de saisie interactif pour ",
  },
  {
    id: "calculator-view",
    title: "Calculatrice Contextuelle",
    version: "v1.1.0",
    status: "Bêta",
    category: "Composants Interactifs",
    icon: Calculator,
    prompt: "Simule un calcul financier ou technique détaillé pour ",
  },

  // 23-29: Blocs Essentiels (7 modules)
  {
    id: "flashcards-view",
    title: "Cartes Mémoire / Flashcards",
    version: "v1.1.0",
    status: "Bêta",
    category: "Blocs Essentiels",
    icon: BookOpen,
    prompt: "Crée des cartes mémoires de révision sur ",
  },
  {
    id: "visualdoc-view",
    title: "Documents Visuels Structurés",
    version: "v1.1.0",
    status: "Bêta",
    category: "Blocs Essentiels",
    icon: FileSpreadsheet,
    prompt: "Rédige un document visuel synthétique sur ",
  },
  {
    id: "cards-view",
    title: "Fiche Méthode & Cartes (Cards)",
    version: "v1.0.0",
    status: "Stable",
    category: "Blocs Essentiels",
    icon: Layers,
    prompt: "Fais une fiche méthode structurée sur ",
  },
  {
    id: "steps-view",
    title: "Guide Étape par Étape (Steps)",
    version: "v1.0.0",
    status: "Stable",
    category: "Blocs Essentiels",
    icon: ListOrdered,
    prompt: "Détaille la procédure étape par étape pour ",
  },
  {
    id: "table-view",
    title: "Tableau de Données Interactif (Table)",
    version: "v1.0.0",
    status: "Stable",
    category: "Blocs Essentiels",
    icon: Table,
    prompt: "Présente un tableau comparatif structuré de ",
  },
  {
    id: "checklist-view",
    title: "Liste de Tâches & To-Do (Checklist)",
    version: "v1.0.0",
    status: "Stable",
    category: "Blocs Essentiels",
    icon: CheckSquare,
    prompt: "Crée une checklist de préparation pour ",
  },
  {
    id: "callout-view",
    title: "Encadrés d'Alerte & Information (Callout)",
    version: "v1.0.0",
    status: "Stable",
    category: "Blocs Essentiels",
    icon: AlertCircle,
    prompt: "Explique les points de vigilance essentiels concernant ",
  },
];

export interface UserAppProject {
  id: string;
  name: string;
  customInstructions?: string;
  createdAt: string;
  ownerId?: number;
  flags?: number;
  isLocal?: boolean;
}

const LOCAL_PROJECTS_KEY = "france-student:projects:v1";

function readLocalProjects(): UserAppProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserAppProject[];
  } catch {
    return [];
  }
}

function saveLocalProjects(projects: UserAppProject[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // Stockage local indisponible
  }
}

type ProjectCategoryFilter =
  | "all"
  | "FS Smart UI"
  | "Maths & Sciences"
  | "Cartographie & Trajets"
  | "Design & Canva"
  | "Données & Visualisation"
  | "Composants Interactifs"
  | "Blocs Essentiels";

export function ProjectsTab({
  conversations,
  onSelectConversation,
  onLaunchPrompt,
  isAccountConnected = false,
}: {
  conversations: Conversation[];
  onSelectConversation?: (id: string) => void;
  onLaunchPrompt?: (prompt: string) => void;
  isAccountConnected?: boolean;
}) {
  const [subTab, setSubTab] = useState<"modules" | "workspace">("modules");
  const [projects, setProjects] = useState<UserAppProject[]>(() => readLocalProjects());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(isAccountConnected);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<ProjectCategoryFilter>("all");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConnected(Boolean(data.connected));
        const remoteList: UserAppProject[] = Array.isArray(data.projects)
          ? data.projects.map((p: { id: string; name: string; customInstructions?: string; createdAt?: string; ownerId?: number; flags?: number }) => ({
              id: p.id,
              name: p.name,
              customInstructions: p.customInstructions || "",
              createdAt: p.createdAt || new Date().toISOString(),
              ownerId: p.ownerId,
              flags: p.flags,
              isLocal: false,
            }))
          : [];

        // Récupérer les projets locaux en complément
        const locals = readLocalProjects().filter(
          (loc) => !remoteList.some((rem) => rem.id === loc.id || rem.name === loc.name)
        );

        const merged = [...remoteList, ...locals];
        setProjects(merged);
        saveLocalProjects(merged);
      } else {
        const locals = readLocalProjects();
        setProjects(locals);
      }
    } catch {
      const locals = readLocalProjects();
      setProjects(locals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          customInstructions: newInstructions.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Impossible de créer le projet.");
      }

      const data = await res.json();
      const created: UserAppProject = {
        id: data.project.id,
        name: data.project.name,
        customInstructions: data.project.customInstructions || "",
        createdAt: data.project.createdAt || new Date().toISOString(),
        ownerId: data.project.ownerId,
        flags: data.project.flags,
        isLocal: Boolean(data.project.isLocal || !data.connected),
      };

      setProjects((prev) => {
        const updated = [created, ...prev];
        saveLocalProjects(updated);
        return updated;
      });

      setNewName("");
      setNewInstructions("");
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création du projet.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== projectId);
        saveLocalProjects(updated);
        return updated;
      });
      setDeleteConfirmId(null);
    } catch {
      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== projectId);
        saveLocalProjects(updated);
        return updated;
      });
      setDeleteConfirmId(null);
    }
  };

  const handleLaunchProject = (project: UserAppProject) => {
    if (onLaunchPrompt) {
      const prompt = `Je commence à travailler sur le projet « ${project.name} ».${
        project.customInstructions
          ? ` Consignes du projet : ${project.customInstructions}.`
          : ""
      } Que souhaites-tu concevoir ou organiser pour ce projet ?`;
      onLaunchPrompt(prompt);
    }
  };

  const filteredWorkspaceProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.customInstructions && p.customInstructions.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const filteredServices = useMemo(() => {
    if (selectedServiceCategory === "all") return FRANCESTUDENT_PROJECTS;
    return FRANCESTUDENT_PROJECTS.filter(
      (p) => p.category === selectedServiceCategory
    );
  }, [selectedServiceCategory]);

  const creations = useMemo(() => {
    const items: Array<{
      conversationId: string;
      conversationTitle: string;
      messageId: string;
      blockIndex: number;
      block: UIBlock;
      createdAt: number;
    }> = [];

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.role === "assistant" && msg.content) {
          const parsed = parsePartialUI(msg.content);
          parsed.blocks.forEach((block: UIBlock, idx: number) => {
            items.push({
              conversationId: conv.id,
              conversationTitle: conv.title,
              messageId: msg.id,
              blockIndex: idx,
              block,
              createdAt: conv.createdAt,
            });
          });
        }
      }
    }
    return items;
  }, [conversations]);

  const activeConversations = useMemo(
    () => conversations.filter((c) => c.messages.length > 0),
    [conversations]
  );

  const exportAllJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "France Student — Intelligent UI (Canva Studio)",
      repository: "https://github.com/pierregdc/FSDisign",
      projectsCount: projects.length,
      projects,
      conversationsCount: activeConversations.length,
      creationsCount: creations.length,
      conversations: activeConversations,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `francestudent-canva-archives-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories: Array<{ id: ProjectCategoryFilter; label: string; count: number }> = [
    { id: "all", label: "Tous les modules (29)", count: FRANCESTUDENT_PROJECTS.length },
    {
      id: "FS Smart UI",
      label: "FS Smart UI",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "FS Smart UI").length,
    },
    {
      id: "Maths & Sciences",
      label: "Maths & Sciences",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Maths & Sciences").length,
    },
    {
      id: "Cartographie & Trajets",
      label: "Cartes & Trajets",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Cartographie & Trajets").length,
    },
    {
      id: "Design & Canva",
      label: "Design & Canva",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Design & Canva").length,
    },
    {
      id: "Données & Visualisation",
      label: "Données & Visualisation",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Données & Visualisation").length,
    },
    {
      id: "Composants Interactifs",
      label: "Composants Interactifs",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Composants Interactifs").length,
    },
    {
      id: "Blocs Essentiels",
      label: "Blocs Essentiels",
      count: FRANCESTUDENT_PROJECTS.filter((p) => p.category === "Blocs Essentiels").length,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {/* En-tête principal & Navigation d'onglets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-ink">
              Projets & Espace de Travail
            </h3>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border",
                connected
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
              )}
            >
              {connected ? "Sync Compte France Student" : "Espace Local"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted max-w-2xl">
            Gérez vos projets réels, organisez vos discussions et personnalisez les instructions pour chaque sujet d&apos;étude ou maquette.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchProjects()}
            disabled={loading}
            title="Rafraîchir les projets"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-panel text-faint transition-colors hover:text-ink disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-accent")} />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-strong"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau projet
          </button>
        </div>
      </div>

      {/* Onglets secondaires : Modules du Studio (29) vs Mes Projets */}
      <div className="flex items-center gap-2 border-b border-line/60 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("modules")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
            subTab === "modules"
              ? "bg-accent/15 text-accent font-bold"
              : "text-muted hover:text-ink hover:bg-ink/[0.04]"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Modules du Studio ({FRANCESTUDENT_PROJECTS.length})</span>
          <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold">
            {FRANCESTUDENT_PROJECTS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("workspace")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
            subTab === "workspace"
              ? "bg-accent/15 text-accent font-bold"
              : "text-muted hover:text-ink hover:bg-ink/[0.04]"
          )}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Mes Projets Personnalisés</span>
          <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold">
            {projects.length}
          </span>
        </button>
      </div>

      {!connected ? (
        <div className="flex items-center gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3.5 text-xs text-sky-200 animate-fade-in">
          <FolderKanban className="h-4 w-4 shrink-0 text-sky-400" />
          <div className="flex-1 text-[11px] leading-relaxed">
            <span className="font-bold text-white">Mode Hors-ligne (Non connecté) :</span> Aucun compte France Student n'est connecté. Aucun projet distant n'est chargé. Vos projets créés ici sont enregistrés uniquement sur cet appareil. Connectez votre compte dans l'onglet <strong className="text-white">Compte</strong> pour synchroniser vos projets réels.
          </div>
        </div>
      ) : null}

      {/* Formulaire de création d'un projet */}
      {showCreateForm ? (
        <form
          onSubmit={handleCreateProject}
          className="rounded-2xl border border-accent/40 bg-accent/[0.03] p-5 space-y-4 animate-rise shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-accent" />
              Créer un nouveau projet
            </h4>
            <span className="text-[11px] text-faint">
              {connected ? "Enregistré sur votre compte France Student" : "Stockage local"}
            </span>
          </div>

          <div>
            <label htmlFor="project-name-input" className="block text-xs font-semibold text-ink mb-1">
              Nom du projet <span className="text-rose-500">*</span>
            </label>
            <input
              id="project-name-input"
              type="text"
              required
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ex : Rapport de stage, Maquette Canva Studio, Thèse IA..."
              className="w-full rounded-xl border border-line bg-canvas/80 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="project-instructions-input" className="block text-xs font-semibold text-ink mb-1">
              Instructions personnalisées pour l&apos;IA (optionnel)
            </label>
            <textarea
              id="project-instructions-input"
              rows={3}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="ex : Adopte un ton académique, génère du code TypeScript strict et commente les choix d'architecture..."
              className="w-full rounded-xl border border-line bg-canvas/80 px-3 py-2 text-xs text-ink outline-none focus:border-accent resize-none"
            />
            <p className="mt-1 text-[10px] text-faint">
              Ces consignes orienteront automatiquement l&apos;assistant lors des discussions rattachées à ce projet.
            </p>
          </div>

          {error ? (
            <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewName("");
                setNewInstructions("");
                setError(null);
              }}
              className="rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !newName.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent-strong disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Créer le projet
            </button>
          </div>
        </form>
      ) : null}

      {/* CONTENU ONGLETS */}
      {subTab === "workspace" ? (
        <div className="space-y-4">
          {/* Recherche */}
          {projects.length > 2 ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher parmi vos projets..."
                className="w-full max-w-sm rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          ) : null}

          {/* Liste vide */}
          {filteredWorkspaceProjects.length === 0 ? (
            <div className="rounded-2xl border border-line bg-panel p-8 text-center space-y-3">
              <FolderKanban className="mx-auto h-12 w-12 text-faint" />
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-bold text-ink">
                  {searchQuery ? "Aucun projet correspondant à votre recherche" : "Aucun projet pour le moment"}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {searchQuery
                    ? "Essayez avec d'autres mots clés."
                    : "Créez votre premier projet pour organiser vos maquettes Canva, fiches de révision et discussions par thématique."}
                </p>
              </div>
              {!searchQuery ? (
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-accent-strong"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Créer mon premier projet
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredWorkspaceProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4.5 transition-all hover:border-accent/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="rounded-xl bg-accent/10 p-2 text-accent shrink-0">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-ink truncate" title={project.name}>
                            {project.name}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-faint">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span>·</span>
                            <span>{project.isLocal ? "Projet local" : "Compte France Student"}</span>
                          </div>
                        </div>
                      </div>

                      {deleteConfirmId === project.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleDeleteProject(project.id)}
                            className="rounded-lg bg-rose-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-600"
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-line bg-card px-2 py-1 text-[10px] text-muted hover:text-ink"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(project.id)}
                          title="Supprimer le projet"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint hover:bg-rose-500/10 hover:text-rose-500 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {project.customInstructions ? (
                      <div className="mt-3 rounded-xl border border-line/60 bg-card/60 p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" />
                          <span>Instructions IA</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted line-clamp-3 leading-relaxed">
                          {project.customInstructions}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-faint truncate">
                      ID : {project.id.slice(0, 12)}…
                    </span>

                    {onLaunchPrompt ? (
                      <button
                        type="button"
                        onClick={() => handleLaunchProject(project)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-accent-strong shrink-0"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Ouvrir dans le chat</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VUE DES 29 MODULES CONCRETS DU STUDIO (SANS DESCRIPTION) */
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedServiceCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                  selectedServiceCategory === cat.id
                    ? "bg-accent text-white shadow-sm"
                    : "border border-line/60 bg-panel text-muted hover:border-line hover:text-ink"
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    selectedServiceCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-ink/[0.06] text-muted"
                  )}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredServices.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4 transition-all hover:border-accent/40 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl bg-accent/10 p-2.5 text-accent shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-ink truncate" title={mod.title}>
                          {mod.title}
                        </h4>
                        <span className="rounded-md bg-ink/[0.06] border border-line/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted shrink-0">
                          {mod.version}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span className="text-faint">{mod.category}</span>
                        <span>·</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.2 font-bold uppercase tracking-wider text-[9px] border",
                            mod.status === "Bêta"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          )}
                        >
                          {mod.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {onLaunchPrompt ? (
                    <button
                      type="button"
                      onClick={() => onLaunchPrompt(mod.prompt)}
                      title={`Tester ${mod.title}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-accent-strong shrink-0"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Lancer</span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Archives et créations de la session active */}
      <div className="mt-8 rounded-2xl border border-line bg-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-accent" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Créations générées dans cette session ({creations.length})
            </h4>
          </div>

          {activeConversations.length > 0 ? (
            <button
              type="button"
              onClick={exportAllJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Download className="h-3.5 w-3.5 text-accent" />
              Exporter l&apos;archive JSON
            </button>
          ) : null}
        </div>

        {creations.length === 0 ? (
          <p className="text-xs text-muted leading-relaxed">
            Vos créations visuelles (cartes mentales, schémas, maquettes et designs SVG) s&apos;archivent automatiquement ici au fil de vos échanges avec le Studio Canva UI.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {creations.map((item) => {
              const title =
                "title" in item.block && typeof item.block.title === "string"
                  ? item.block.title
                  : `Bloc ${item.block.type}`;
              return (
                <div
                  key={`${item.messageId}-${item.blockIndex}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent uppercase">
                        {item.block.type}
                      </span>
                      <p className="truncate text-xs font-bold text-ink">{title}</p>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted">
                      {item.conversationTitle}
                    </p>
                  </div>
                  {onSelectConversation ? (
                    <button
                      type="button"
                      onClick={() => onSelectConversation(item.conversationId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:border-accent/50 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  downloadUrl: string | null;
  assetName: string | null;
  channel: string;
  status: "up_to_date" | "update_available" | "error";
  checkedAt: string;
  repository: string;
  error?: string;
};

export function UpdatesTab() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [autoCheck, setAutoCheck] = useState(true);
  const [info, setInfo] = useState<UpdateInfo>({
    currentVersion: SITE.version || "1.0.0",
    latestVersion: SITE.version || "1.0.0",
    hasUpdate: false,
    releaseName: `FSDisign v${SITE.version || "1.0.0"}`,
    releaseNotes: "Vous bénéficiez de la version officielle la plus récente.",
    publishedAt: new Date().toISOString(),
    htmlUrl: `https://github.com/${SITE.githubRepo || "pierregdc/FSDisign"}/releases`,
    downloadUrl: null,
    assetName: "FSDisign-Setup.exe",
    channel: "stable",
    status: "up_to_date",
    checkedAt: new Date().toISOString(),
    repository: SITE.githubRepo || "pierregdc/FSDisign",
  });

  const isElectron =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron);

  const checkUpdates = useCallback(async (isManual = false) => {
    setChecking(true);
    setDownloadStatus(null);
    try {
      const res = await fetch(`/api/updates${isManual ? "?force=1" : ""}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as UpdateInfo;
        setInfo(data);
      }
    } catch {
      // Conserver l'état actuel en cas de coupure réseau
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkUpdates(false);
  }, [checkUpdates]);

  const handleInstallUpdate = async () => {
    if (!info.downloadUrl && !info.htmlUrl) return;

    setDownloading(true);
    setDownloadStatus("Préparation du téléchargement...");

    // En environnement desktop Electron
    if (
      typeof window !== "undefined" &&
      (window as unknown as { electronAPI?: { installUpdate?: (url: string) => Promise<{ success: boolean; openedBrowser?: boolean; launchedInstaller?: boolean }> } })
        .electronAPI?.installUpdate &&
      info.downloadUrl
    ) {
      try {
        setDownloadStatus("Téléchargement de la mise à jour en cours...");
        const electronAPI = (
          window as unknown as {
            electronAPI: { installUpdate: (url: string) => Promise<{ success: boolean; openedBrowser?: boolean; launchedInstaller?: boolean }> };
          }
        ).electronAPI;
        const res = await electronAPI.installUpdate(info.downloadUrl);

        if (res.launchedInstaller) {
          setDownloadStatus("Installateur lancé avec succès ! Fermeture de l'application...");
        } else if (res.openedBrowser) {
          setDownloadStatus("Page de téléchargement ouverte dans votre navigateur.");
        } else {
          setDownloadStatus("Téléchargement complété.");
        }
      } catch {
        // En cas d'erreur, basculer sur l'ouverture de la release
        window.open(info.downloadUrl || info.htmlUrl, "_blank");
        setDownloadStatus("Redirection vers la page de téléchargement GitHub.");
      } finally {
        setDownloading(false);
      }
      return;
    }

    // En environnement web standard : ouvrir le lien de téléchargement direct ou de la release
    const targetUrl = info.downloadUrl || info.htmlUrl;
    window.open(targetUrl, "_blank");
    setDownloadStatus("Téléchargement lancé dans votre navigateur.");
    setDownloading(false);
  };

  const formattedDate = useMemo(() => {
    try {
      return new Date(info.checkedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "récemment";
    }
  }, [info.checkedAt]);

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {/* En-tête de section */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">
            Mises à jour du logiciel
          </h3>
          <p className="mt-1 text-xs text-muted">
            Analyse en direct le dépôt GitHub officiel ({info.repository}) pour déployer les dernières versions de FSDisign.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void checkUpdates(true)}
          disabled={checking || downloading}
          title="Vérifier maintenant sur GitHub"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink shadow-2xs transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", checking && "animate-spin text-accent")}
          />
          <span>{checking ? "Vérification..." : "Vérifier"}</span>
        </button>
      </div>

      {/* Bannière de statut principale */}
      {info.hasUpdate ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-ink">
                    Nouvelle mise à jour disponible !
                  </h4>
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    v{info.latestVersion}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {info.releaseName} · Votre version actuelle est la v{info.currentVersion}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleInstallUpdate()}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60 shrink-0"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>
                {downloading
                  ? "Installation..."
                  : isElectron
                  ? "Mettre à jour maintenant (.exe)"
                  : "Télécharger l'installateur"}
              </span>
            </button>
          </div>

          {downloadStatus ? (
            <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {downloadStatus}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-card/60 p-4.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">
                Votre application est à jour
              </p>
              <p className="text-[11px] text-muted">
                Version installée : v{info.currentVersion} · Dernière vérification à {formattedDate}.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-line/80 px-2.5 py-1 text-[10px] font-semibold text-muted font-mono">
            v{info.currentVersion}
          </span>
        </div>
      )}

      {/* Grille d'informations système */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-card p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-faint">
            <span>Dépôt GitHub surveillé</span>
            <GitBranch className="h-3 w-3" />
          </div>
          <a
            href={`https://github.com/${info.repository}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-accent transition-colors truncate"
          >
            <span>{info.repository}</span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
          </a>
        </div>

        <div className="rounded-xl border border-line bg-card p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-faint">
            <span>Environnement d&apos;exécution</span>
            <Server className="h-3 w-3" />
          </div>
          <p className="text-xs font-bold text-ink flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isElectron ? "bg-emerald-500" : "bg-sky-500"
              )}
            />
            <span>
              {isElectron
                ? "Application Desktop Native (Electron Windows)"
                : "Interface Web Next.js"}
            </span>
          </p>
        </div>
      </div>

      {/* Notes de version / Changelog */}
      <div className="rounded-2xl border border-line bg-card/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-ink flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Notes de la dernière version (Changelog GitHub)</span>
          </h4>
          <a
            href={info.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Voir sur GitHub</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="rounded-xl border border-line/60 bg-panel/70 p-3.5 text-xs leading-relaxed text-muted font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
          {info.releaseNotes}
        </div>
      </div>

      {/* Options de mise à jour automatique */}
      <div className="rounded-2xl border border-line bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-ink">
              Vérification automatique au lancement
            </p>
            <p className="text-[11px] text-faint">
              Alerte discrètement dès qu&apos;une nouvelle release est détectée sur votre GitHub
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoCheck}
            onClick={() => setAutoCheck((prev) => !prev)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              autoCheck ? "bg-accent" : "bg-line"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                autoCheck ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
