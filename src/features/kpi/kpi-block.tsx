"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar } from "@/features/canva";
import { cn } from "@/lib/utils";

type KpiBlockData = Extract<UIBlock, { type: "kpi" }>;

type NormalizedKpiItem = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "neutral";
  target?: string;
  hint?: string;
};

// Analyse sémantique pour associer icône, palette et micro-sparkline
function getKpiMeta(label: string, value: string, idx: number) {
  const l = label.toLowerCase();
  const v = value.toLowerCase();

  if (l.includes("heur") || l.includes("temp") || l.includes("durée") || l.includes("time") || v.includes("h")) {
    return {
      icon: Clock,
      color: "sky",
      badgeClass: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
      iconBg: "bg-sky-500/10 text-sky-400",
      gradient: "from-sky-500 to-blue-600",
      sparkline: [35, 55, 70, 60, 85, 45, 95],
      highlightDay: 6,
    };
  }

  if (l.includes("fich") || l.includes("cours") || l.includes("synth") || l.includes("leçon") || l.includes("doc")) {
    return {
      icon: BookOpen,
      color: "emerald",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      gradient: "from-emerald-500 to-teal-500",
      sparkline: [40, 50, 65, 80, 75, 90, 88],
      highlightDay: 6,
    };
  }

  if (l.includes("quiz") || l.includes("score") || l.includes("note") || l.includes("moyenn") || l.includes("eval") || v.includes("/20")) {
    return {
      icon: Award,
      color: "violet",
      badgeClass: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
      iconBg: "bg-violet-500/10 text-violet-400",
      gradient: "from-violet-500 to-indigo-500",
      sparkline: [45, 60, 75, 65, 80, 70, 92],
      highlightDay: 6,
    };
  }

  if (l.includes("rappel") || l.includes("attente") || l.includes("retard") || l.includes("alert") || l.includes("urgent")) {
    return {
      icon: AlertCircle,
      color: "amber",
      badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      iconBg: "bg-amber-500/10 text-amber-400",
      gradient: "from-amber-500 to-orange-500",
      sparkline: [90, 75, 60, 45, 30, 25, 20],
      highlightDay: 6,
    };
  }

  // Fallback selon l'index
  const fallbacks = [
    {
      icon: TrendingUp,
      color: "sky",
      badgeClass: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
      iconBg: "bg-sky-500/10 text-sky-400",
      gradient: "from-sky-500 to-blue-600",
      sparkline: [30, 45, 60, 50, 75, 60, 85],
      highlightDay: 6,
    },
    {
      icon: Activity,
      color: "emerald",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      gradient: "from-emerald-500 to-teal-500",
      sparkline: [50, 60, 70, 65, 80, 85, 90],
      highlightDay: 6,
    },
  ];

  return fallbacks[idx % fallbacks.length];
}

// Calcul du pourcentage d'avancement
function computeProgress(value: string, target?: string, hint?: string): number | null {
  // Cas 1: Ratio explicite "17.4/20"
  const ratioMatch = value.match(/([\d.,]+)\s*\/\s*([\d.,]+)/);
  if (ratioMatch) {
    const num = parseFloat(ratioMatch[1].replace(",", "."));
    const den = parseFloat(ratioMatch[2].replace(",", "."));
    if (den > 0) return Math.min(100, Math.max(0, Math.round((num / den) * 100)));
  }

  // Cas 2: Valeur et Cible numérique
  if (target) {
    const valNum = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
    const targetNum = parseFloat(target.replace(/[^\d.,]/g, "").replace(",", "."));
    if (!isNaN(valNum) && !isNaN(targetNum) && targetNum > 0) {
      return Math.min(100, Math.max(0, Math.round((valNum / targetNum) * 100)));
    }
  }

  // Cas 3: Indication "sur 32" dans le hint
  if (hint) {
    const hintMatch = hint.match(/sur\s+([\d.,]+)/i);
    if (hintMatch) {
      const valNum = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
      const den = parseFloat(hintMatch[1].replace(",", "."));
      if (!isNaN(valNum) && den > 0) {
        return Math.min(100, Math.max(0, Math.round((valNum / den) * 100)));
      }
    }
  }

  return null;
}

export function KpiBlockView({ block }: { block: KpiBlockData }) {
  // Normalisation tolérante (supporte block.items ou block.metrics)
  const rawList = block.items || (block as unknown as { metrics?: unknown[] }).metrics || [];
  const items: NormalizedKpiItem[] = useMemo(() => {
    return rawList.map((rawItem: unknown) => {
      const item = rawItem as Record<string, unknown>;
      return {
        label: String(item.label || "Indicateur"),
        value: String(item.value || "0"),
        change: (item.change ?? item.delta) ? String(item.change ?? item.delta) : undefined,
        trend: (item.trend as "up" | "down" | "neutral") || undefined,
        status: (item.status as "success" | "warning" | "danger" | "neutral") || undefined,
        target: item.target ? String(item.target) : undefined,
        hint: item.hint ? String(item.hint) : undefined,
      };
    });
  }, [rawList]);

  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="w-full space-y-5 animate-fade-in">
      <CanvaToolbar title={block.title || "Indicateurs KPI"} jsonData={block} />

      {/* En-tête de tableau de bord moderne et immersif sans bordure globale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold tracking-tight text-white">
              {block.title || "Tableau de Bord & Indicateurs Clés"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Suivi hebdomadaire de la performance académique et atteinte des objectifs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            87 % des objectifs atteints
          </span>
        </div>
      </div>

      {/* Grille de cartes KPI individuelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((kpi, idx) => {
          const meta = getKpiMeta(kpi.label, kpi.value, idx);
          const IconComponent = meta.icon;
          const progress = computeProgress(kpi.value, kpi.target, kpi.hint);

          const isUp = kpi.trend === "up" || (kpi.change && kpi.change.startsWith("+"));
          const isDown = kpi.trend === "down" || (kpi.change && kpi.change.startsWith("-"));

          return (
            <div
              key={idx}
              className="group relative rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 p-5 transition-all duration-300 border border-white/[0.06] hover:border-sky-500/30 flex flex-col justify-between shadow-xl shadow-black/30 backdrop-blur-md"
            >
              {/* Ligne 1 : Icône + Label + Badge Delta */}
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                        meta.iconBg
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {kpi.label}
                    </span>
                  </div>

                  {kpi.change && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0",
                        isUp
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : isDown
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                      )}
                    >
                      {isUp ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : isDown ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {kpi.change}
                    </span>
                  )}
                </div>

                {/* Ligne 2 : Valeur Principale en Grand Monospace */}
                <div className="mt-3.5 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                    {kpi.value}
                  </span>
                </div>

                {/* Ligne 3 : Jauge de progression visuelle si applicable */}
                {progress !== null ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Progression</span>
                      <span className="font-bold text-white font-mono">{progress} %</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                          meta.gradient
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Statut actuel</span>
                      <span className="font-bold text-emerald-400">Actif</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                          meta.gradient
                        )}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}

                {/* Ligne 4 : Micro-sparkline d'activité sur 7 jours (L M M J V S D) */}
                <div className="mt-3.5 pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Activité 7 jours
                    </span>
                    <span className="text-[10px] text-slate-400">Lun - Dim</span>
                  </div>
                  <div className="flex items-end justify-between gap-1.5 h-8">
                    {meta.sparkline.map((val, dIdx) => {
                      const isToday = dIdx === meta.highlightDay;
                      return (
                        <div key={dIdx} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-slate-800/80 rounded-xs h-6 flex items-end overflow-hidden p-0.5">
                            <div
                              className={cn(
                                "w-full rounded-xs transition-all duration-500",
                                isToday ? meta.gradient.replace("from-", "bg-").split(" ")[0] : "bg-slate-600/70"
                              )}
                              style={{ height: `${Math.max(18, val)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-[9px] font-mono",
                              isToday ? "font-bold text-sky-400" : "text-slate-400"
                            )}
                          >
                            {daysOfWeek[dIdx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ligne 5 : Cible et Indication de contexte */}
              <div className="mt-3.5 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400 gap-1.5">
                {kpi.target ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Target className="h-3 w-3 text-sky-400 shrink-0" />
                    <span className="whitespace-nowrap">Cible : <strong className="text-slate-300 font-medium">{kpi.target}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>À jour</span>
                  </div>
                )}

                {kpi.hint && (
                  <span className="text-slate-400 shrink-0 text-[10px]">
                    {kpi.hint}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
