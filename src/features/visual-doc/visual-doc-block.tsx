"use client";

import { CheckCircle2, GraduationCap, Lightbulb } from "lucide-react";
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
        <div class="p-5 rounded-xl border-none ${sec.highlight ? "bg-indigo-50/70" : "bg-slate-50"}">
          <h2 class="text-base font-bold text-slate-800 mb-2">${i + 1}. ${sec.heading}</h2>
          <p class="text-sm text-slate-700 leading-relaxed">${sec.content}</p>
          ${sec.bullets && sec.bullets.length > 0 ? `
            <ul class="mt-3 space-y-1 text-xs text-slate-700 pt-2">
              ${sec.bullets.map(b => `<li>• ${b}</li>`).join("")}
            </ul>
          ` : ""}
          ${sec.takeaway ? `
            <div class="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-900 font-medium border-none">
              💡 Point clé : ${sec.takeaway}
            </div>
          ` : ""}
        </div>
      `).join("")}
    </div>
  </div>`;

  return (
    <div className="w-full space-y-6">
      {/* Barre d'outils Canva (masquée globalement selon configuration) */}
      <CanvaToolbar
        title={block.title}
        jsonData={block}
        htmlContent={docHtmlContent}
      />

      <div className="w-full">
        {/* En-tête officiel et épuré du document */}
        <div className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-400">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{block.badge || getDocBadge()}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {block.title}
              </h2>
              {block.subtitle && (
                <p className="mt-2 text-sm text-slate-400 leading-relaxed font-normal max-w-2xl">
                  {block.subtitle}
                </p>
              )}
            </div>

            {block.author && (
              <div className="text-right text-xs">
                <span className="font-semibold text-slate-200">{block.author}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">France Student</p>
              </div>
            )}
          </div>

          <div className="mt-5 h-px w-full bg-gradient-to-r from-sky-500/40 via-slate-800 to-transparent" />
        </div>

        {/* Sections du document : 100% sans bordures superflues */}
        <div className="space-y-4 pt-2">
          {block.sections.map((sec, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl p-5 sm:p-6 transition-all border-none",
                sec.highlight
                  ? "bg-sky-950/25"
                  : "bg-slate-900/35"
              )}
            >
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold",
                    sec.highlight
                      ? "bg-sky-500 text-slate-950 font-black"
                      : "bg-sky-500/15 text-sky-400"
                  )}
                >
                  {idx + 1}
                </span>
                <span>{sec.heading}</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-8.5">
                {sec.content}
              </p>

              {/* Puces additionnelles */}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="mt-3.5 space-y-2 pl-8.5">
                  {sec.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Boîte « À retenir » / Takeaway sans contour rigide */}
              {sec.takeaway && (
                <div className="mt-4 ml-8.5 rounded-xl bg-amber-500/10 p-3.5 text-xs flex items-start gap-3 border-none">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block">
                      Point clé à retenir
                    </span>
                    <p className="mt-1 text-slate-300 leading-relaxed">{sec.takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pied de document discret */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>Fiche méthode · France Student Canva</span>
          <span>ia.francestudent.org</span>
        </div>
      </div>
    </div>
  );
}
