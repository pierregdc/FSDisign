"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Minus,
  Target,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar } from "@/features/canva";
import { cn } from "@/lib/utils";

type KpiBlockData = Extract<UIBlock, { type: "kpi" }>;

export function KpiBlockView({ block }: { block: KpiBlockData }) {
  const kpiHtmlContent = `<div class="max-w-4xl mx-auto space-y-4">
    <div class="text-center">
      <h2 class="text-xl font-bold">${block.title || "Indicateurs KPI"}</h2>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${block.items.map((kpi) => `
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <p class="text-xs text-slate-500 font-medium">${kpi.label}</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">${kpi.value}</p>
          ${kpi.change ? `<span class="inline-block mt-1 text-[11px] font-semibold text-indigo-600">${kpi.change}</span>` : ""}
          ${kpi.target ? `<p class="text-[10px] text-slate-400 mt-0.5">Cible : ${kpi.target}</p>` : ""}
        </div>
      `).join("")}
    </div>
  </div>`;

  return (
    <div className="space-y-2.5">
      <CanvaToolbar
        title={block.title || "Indicateurs KPI"}
        jsonData={block}
        htmlContent={kpiHtmlContent}
      />

      <div className="rounded-xl border border-line/70 bg-card p-4 shadow-2xs">
        {block.title && (
          <div className="mb-3.5 flex items-center justify-between border-b border-line/60 pb-2.5">
            <h3 className="text-xs font-semibold text-ink flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span>{block.title}</span>
            </h3>
            <span className="text-[11px] text-muted font-normal">
              {block.items.length} {block.items.length > 1 ? "indicateurs clés" : "indicateur"}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {block.items.map((kpi, idx) => {
            const isUp = kpi.trend === "up";
            const isDown = kpi.trend === "down";

            let statusBorder = "border-line/70";
            let statusBg = "bg-panel/60";
            if (kpi.status === "success") {
              statusBorder = "border-emerald-500/20";
              statusBg = "bg-emerald-500/[0.04]";
            } else if (kpi.status === "warning") {
              statusBorder = "border-amber-500/20";
              statusBg = "bg-amber-500/[0.04]";
            } else if (kpi.status === "danger") {
              statusBorder = "border-rose-500/20";
              statusBg = "bg-rose-500/[0.04]";
            }

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-lg border p-3.5 transition-all hover:bg-card hover:border-line",
                  statusBorder,
                  statusBg
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted truncate">{kpi.label}</span>
                  {kpi.change && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isUp
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : isDown
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-slate-500/10 text-slate-600"
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

                <p className="mt-2 text-2xl font-black tracking-tight text-ink">{kpi.value}</p>

                {kpi.target && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted">
                    <Target className="h-3 w-3 text-faint" />
                    <span>Objectif : {kpi.target}</span>
                  </div>
                )}

                {kpi.hint && (
                  <p className="mt-1 text-[11px] text-faint leading-relaxed">{kpi.hint}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
