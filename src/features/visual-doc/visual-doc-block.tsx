"use client";

import {
  CheckCircle2,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar } from "@/features/canva";
import { cn } from "@/lib/utils";

type VisualDocBlockData = Extract<UIBlock, { type: "visualDoc" }>;

export function VisualDocBlockView({ block }: { block: VisualDocBlockData }) {
  const getDocBadge = () => {
    switch (block.docType) {
      case "sheet":
        return "Fiche Synthèse";
      case "poster":
        return "Affiche Visuelle";
      case "cover":
        return "Couverture Document";
      case "pedagogy":
        return "Support Pédagogique";
      case "report":
        return "Rapport Visuel";
      case "synthesis":
      default:
        return "Fiche Pratique";
    }
  };

  const docHtmlContent = `<div class="max-w-3xl mx-auto space-y-6">
    <div class="border-b-2 border-indigo-200 pb-4">
      <span class="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
        ${block.badge || getDocBadge()}
      </span>
      <h1 class="text-2xl font-black text-slate-900">${block.title}</h1>
      ${block.subtitle ? `<p class="text-sm text-slate-600 mt-1">${block.subtitle}</p>` : ""}
    </div>
    <div class="space-y-6">
      ${block.sections.map((sec, i) => `
        <div class="p-5 rounded-xl border ${sec.highlight ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200 bg-slate-50"}">
          <h2 class="text-base font-bold text-slate-800 mb-2">${i + 1}. ${sec.heading}</h2>
          <p class="text-sm text-slate-700 leading-relaxed">${sec.content}</p>
          ${sec.bullets && sec.bullets.length > 0 ? `
            <ul class="mt-3 space-y-1 text-xs text-slate-700 border-t border-slate-200 pt-2">
              ${sec.bullets.map(b => `<li>• ${b}</li>`).join("")}
            </ul>
          ` : ""}
          ${sec.takeaway ? `
            <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
              💡 Point clé : ${sec.takeaway}
            </div>
          ` : ""}
        </div>
      `).join("")}
    </div>
  </div>`;

  return (
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
      <CanvaToolbar
        title={block.title}
        jsonData={block}
        htmlContent={docHtmlContent}
      />

      <div className="rounded-2xl border border-line/60 bg-card p-6 sm:p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* En-tête officiel du document */}
        <div className="border-b-2 border-accent/20 pb-5 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{block.badge || getDocBadge()}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {block.title}
            </h2>
            {block.subtitle && (
              <p className="mt-1.5 text-sm text-muted leading-relaxed font-medium">
                {block.subtitle}
              </p>
            )}
          </div>

          {block.author && (
            <div className="text-right text-xs text-muted">
              <span className="font-semibold text-ink">{block.author}</span>
              <p className="text-[11px] text-faint">France Student Canva</p>
            </div>
          )}
        </div>

        {/* Sections du document */}
        <div className="space-y-6">
          {block.sections.map((sec, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl p-4 sm:p-5 transition-all",
                sec.highlight
                  ? "border border-accent/30 bg-accent/5"
                  : "border border-line bg-panel/70"
              )}
            >
              <h3 className="text-base font-bold text-ink mb-2 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {idx + 1}
                </span>
                <span>{sec.heading}</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>

              {/* Puces additionnelles */}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-line/60 pt-3">
                  {sec.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-xs text-ink">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Boîte « À retenir » / Takeaway */}
              {sec.takeaway && (
                <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-ink flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                      Point clé à retenir
                    </span>
                    <p className="mt-0.5 text-muted leading-relaxed">{sec.takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pied de document prêt pour l'impression */}
        <div className="mt-8 border-t border-line pt-4 flex flex-wrap items-center justify-between text-[11px] text-faint">
          <span>Document généré pour l&apos;étudiant · Intelligent UI Canva</span>
          <span>© France Student · ia.francestudent.org</span>
        </div>
      </div>
    </div>
  );
}
