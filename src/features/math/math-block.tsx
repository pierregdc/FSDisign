"use client";

import React, { useState, useMemo, useId } from "react";
import {
  Calculator,
  Compass,
  TrendingUp,
  Table as TableIcon,
  Copy,
  Check,
  Download,
  Info,
  Maximize2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

type MathTab = "overview" | "formulas" | "geometry" | "functionPlot" | "spreadsheet";

type MathBlockData = Extract<UIBlock, { type: "math" }>;

interface MathBlockProps {
  block: MathBlockData;
  defaultTab?: MathTab;
  className?: string;
}

/**
 * Évaluateur mathématique sécurisé pour fonctions analytiques f(x)
 */
function evaluateMathFunction(expr: string, x: number): number {
  try {
    // Nettoyer l'expression et remplacer les opérateurs mathématiques usuels
    const cleaned = expr
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\bln\b/g, "Math.log")
      .replace(/\blog\b/g, "Math.log10")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\bpi\b/gi, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/(\d)(x)/gi, "$1*$2")
      .replace(/(\))(x)/gi, "$1*$2");

    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `"use strict"; return (${cleaned});`);
    const result = fn(x);
    return typeof result === "number" && !Number.isNaN(result) && Number.isFinite(result)
      ? result
      : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Rendu stylisé KaTeX-like pour formules LaTeX simples
 */
function MathFormulaDisplay({ latex, className }: { latex: string; className?: string }) {
  // Formatage lisible des symboles usuels
  const formatted = latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\pm/g, "±")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\theta/g, "θ")
    .replace(/\\pi/g, "π")
    .replace(/\\int/g, "∫")
    .replace(/\\sum/g, "∑")
    .replace(/\\infty/g, "∞")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\rightarrow/g, "→");

  return (
    <div
      className={cn(
        "font-mono font-semibold tracking-wide text-indigo-200 select-all overflow-x-auto py-1",
        className
      )}
    >
      {formatted}
    </div>
  );
}

export function MathBlockView({ block, defaultTab, className }: MathBlockProps) {
  const hasFormulas = Boolean(block.formulas && block.formulas.length > 0);
  const hasGeometry = Boolean(block.geometry);
  const hasPlot = Boolean(block.functionPlot);
  const hasSpreadsheet = Boolean(block.spreadsheet);

  // Détection d'un mode unique (ex: l'utilisateur a demandé seulement un graphique, ou seulement une géométrie)
  const activeCount = [hasFormulas, hasGeometry, hasPlot, hasSpreadsheet].filter(Boolean).length;
  const isSingleMode = activeCount === 1;

  const initialTab: MathTab = useMemo(() => {
    if (defaultTab) return defaultTab;
    if (isSingleMode) {
      if (hasGeometry) return "geometry";
      if (hasPlot) return "functionPlot";
      if (hasSpreadsheet) return "spreadsheet";
      if (hasFormulas) return "formulas";
    }
    return "overview";
  }, [defaultTab, isSingleMode, hasGeometry, hasPlot, hasSpreadsheet, hasFormulas]);

  const [activeTab, setActiveTab] = useState<MathTab>(initialTab);
  const [copiedLatex, setCopiedLatex] = useState<string | null>(null);
  const [hoveredPlotPoint, setHoveredPlotPoint] = useState<{ x: number; y: number } | null>(null);

  // Filtre / recherche tableur
  const [spreadsheetSearch, setSpreadsheetSearch] = useState("");

  const handleCopyLatex = (latex: string) => {
    navigator.clipboard?.writeText(latex);
    setCopiedLatex(latex);
    setTimeout(() => setCopiedLatex(null), 2000);
  };

  const handleExportCsv = () => {
    if (!block.spreadsheet) return;
    const { columns, rows } = block.spreadsheet;
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(";");
    const lines = rows.map((r) =>
      columns.map((c) => `"${String(r[c.id] ?? "").replace(/"/g, '""')}"`).join(";")
    );
    const csvContent = "\uFEFF" + [headers, ...lines].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${block.title.toLowerCase().replace(/\s+/g, "_")}_tableur.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calcul du tracé de fonction
  const plotData = useMemo(() => {
    if (!block.functionPlot) return null;
    const {
      fn,
      fn2,
      xMin = -6,
      xMax = 6,
      yMin: explicitYMin,
      yMax: explicitYMax,
    } = block.functionPlot;

    const samples = 180;
    const dx = (xMax - xMin) / samples;
    const points: Array<{ x: number; y: number }> = [];
    const points2: Array<{ x: number; y: number }> = [];

    let computedYMin = Infinity;
    let computedYMax = -Infinity;

    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * dx;
      const y = evaluateMathFunction(fn, x);
      if (!Number.isNaN(y)) {
        points.push({ x, y });
        if (y < computedYMin) computedYMin = y;
        if (y > computedYMax) computedYMax = y;
      }
      if (fn2) {
        const y2 = evaluateMathFunction(fn2, x);
        if (!Number.isNaN(y2)) {
          points2.push({ x, y: y2 });
          if (y2 < computedYMin) computedYMin = y2;
          if (y2 > computedYMax) computedYMax = y2;
        }
      }
    }

    if (computedYMin === Infinity) computedYMin = -10;
    if (computedYMax === -Infinity) computedYMax = 10;
    if (computedYMin === computedYMax) {
      computedYMin -= 1;
      computedYMax += 1;
    }

    // Marge de 10%
    const yMargin = (computedYMax - computedYMin) * 0.1 || 1;
    const yMin = explicitYMin !== undefined ? explicitYMin : computedYMin - yMargin;
    const yMax = explicitYMax !== undefined ? explicitYMax : computedYMax + yMargin;

    return {
      points,
      points2,
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }, [block.functionPlot]);

  // Statistiques pour le tableur (Somme, Moyenne, Min, Max pour colonnes numériques)
  const spreadsheetStats = useMemo(() => {
    if (!block.spreadsheet) return null;
    const { columns, rows } = block.spreadsheet;
    const stats: Record<string, { sum: number; avg: number; min: number; max: number; isNum: boolean }> = {};

    columns.forEach((col) => {
      let isNum = true;
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;
      let count = 0;

      rows.forEach((row) => {
        const val = row[col.id];
        const num = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
        if (!Number.isNaN(num)) {
          sum += num;
          if (num < min) min = num;
          if (num > max) max = num;
          count++;
        } else {
          isNum = false;
        }
      });

      if (isNum && count > 0) {
        stats[col.id] = {
          sum: Math.round(sum * 100) / 100,
          avg: Math.round((sum / count) * 100) / 100,
          min,
          max,
          isNum: true,
        };
      }
    });

    return stats;
  }, [block.spreadsheet]);

  // ID unique pour gradients SVG
  const svgId = useId().replace(/:/g, "");

  return (
    <div className={cn("w-full max-w-6xl space-y-6 text-slate-100", className)}>
      {/* 1. EN-TÊTE PRINCIPAL MATHÉMATIQUES */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Calculator className="h-3.5 w-3.5 text-indigo-400" />
                Module Mathématiques
              </span>
              {block.topic && (
                <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-mono text-slate-300 uppercase">
                  {block.topic}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">{block.title}</h2>

            {block.description && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {block.description}
              </p>
            )}
          </div>

          {block.summary && (
            <div className="rounded-xl bg-indigo-950/40 p-4 border-l-4 border-indigo-500 max-w-sm shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Synthèse / Propriété clé
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{block.summary}</p>
            </div>
          )}
        </div>

        {/* 2. SÉLECTEUR D'ONGLETS THÉMATIQUES (SI MULTIMODE) */}
        {!isSingleMode && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/40">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Vue d&apos;ensemble
            </button>

            {hasFormulas && (
              <button
                type="button"
                onClick={() => setActiveTab("formulas")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                  activeTab === "formulas"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Calculator className="h-3.5 w-3.5" />
                Formules &amp; Étapes
                <span className="rounded-full bg-indigo-500/30 px-1.5 py-0.2 text-[10px] font-mono">
                  {block.formulas?.length}
                </span>
              </button>
            )}

            {hasGeometry && (
              <button
                type="button"
                onClick={() => setActiveTab("geometry")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                  activeTab === "geometry"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                Géométrie 2D/3D
              </button>
            )}

            {hasPlot && (
              <button
                type="button"
                onClick={() => setActiveTab("functionPlot")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                  activeTab === "functionPlot"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Graphique de Fonction
              </button>
            )}

            {hasSpreadsheet && (
              <button
                type="button"
                onClick={() => setActiveTab("spreadsheet")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                  activeTab === "spreadsheet"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Tableur &amp; Valeurs
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. VUE D'ENSEMBLE (OVERVIEW) */}
      {activeTab === "overview" && !isSingleMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc Formule Principale */}
          {hasFormulas && block.formulas && block.formulas[0] && (
            <div className="rounded-2xl bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="h-4 w-4" />
                  Formule principale
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("formulas")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  Voir détails <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-4 space-y-2">
                <div className="text-xs text-slate-400 font-semibold">{block.formulas[0].name}</div>
                <MathFormulaDisplay latex={block.formulas[0].latex} className="text-lg text-indigo-300" />
                {block.formulas[0].explanation && (
                  <p className="text-xs text-slate-300 pt-1 border-t border-slate-800/40">
                    {block.formulas[0].explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bloc Géométrie Aperçu */}
          {hasGeometry && block.geometry && (
            <div className="rounded-2xl bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  Figure géométrique ({block.geometry.shapeType})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("geometry")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  Agrandir <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-4 space-y-2">
                <div className="text-xs font-semibold text-white">
                  {block.geometry.title || "Représentation Géométrique"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {block.geometry.properties?.slice(0, 4).map((p, i) => (
                    <div key={i} className="rounded-lg bg-slate-900/80 p-2">
                      <div className="text-[10px] text-slate-400">{p.label}</div>
                      <div className="font-mono font-bold text-emerald-400">{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bloc Graphique de Fonction Aperçu */}
          {hasPlot && block.functionPlot && (
            <div className="rounded-2xl bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Courbe f(x) = {block.functionPlot.fn}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("functionPlot")}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                >
                  Tracé complet <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-4 space-y-2">
                <div className="text-xs text-slate-400">
                  Domaine d&apos;étude : [{block.functionPlot.xMin}, {block.functionPlot.xMax}]
                </div>
                {block.functionPlot.keyPoints && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {block.functionPlot.keyPoints.slice(0, 3).map((kp, i) => (
                      <span key={i} className="rounded-full bg-sky-950/60 px-2.5 py-1 text-sky-300 font-mono text-[11px]">
                        {kp.label} : ({kp.x}, {kp.y})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bloc Tableur Aperçu */}
          {hasSpreadsheet && block.spreadsheet && (
            <div className="rounded-2xl bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TableIcon className="h-4 w-4" />
                  Tableur ({block.spreadsheet.rows.length} lignes)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("spreadsheet")}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  Ouvrir tableur <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-4 space-y-2">
                <div className="text-xs text-slate-300 font-medium">
                  {block.spreadsheet.title || "Tableau de calcul & variations"}
                </div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                  {block.spreadsheet.columns.map((c) => (
                    <span key={c.id} className="rounded bg-slate-900 px-2 py-0.5 font-mono text-amber-300">
                      {c.header} {c.formula ? `(${c.formula})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ONGLET FORMULES & DÉMONSTRATIONS */}
      {(activeTab === "formulas" || (isSingleMode && hasFormulas)) && block.formulas && (
        <div className="space-y-6">
          {block.formulas.map((formula, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-indigo-400" />
                    {formula.name}
                  </h3>
                  {formula.explanation && (
                    <p className="text-xs text-slate-400 mt-0.5">{formula.explanation}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLatex(formula.latex)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {copiedLatex === formula.latex ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copier LaTeX
                    </>
                  )}
                </button>
              </div>

              {/* Rendu Formule LaTeX Principale */}
              <div className="rounded-xl bg-slate-950/80 p-5 flex flex-col items-center justify-center text-center">
                <MathFormulaDisplay latex={formula.latex} className="text-2xl text-indigo-300" />
              </div>

              {/* Variables & Définitions */}
              {formula.variables && formula.variables.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Variables et Paramètres
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {formula.variables.map((v, vIdx) => (
                      <div key={vIdx} className="rounded-xl bg-slate-800/40 p-3 flex items-start gap-3">
                        <div className="rounded-lg bg-indigo-500/20 px-2 py-1 font-mono font-bold text-indigo-300 text-sm">
                          {v.symbol}
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="text-xs text-white font-medium truncate">{v.meaning}</div>
                          {v.value && (
                            <div className="text-[11px] font-mono text-emerald-400">{v.value}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Étapes pas à pas de la démonstration / résolution */}
              {formula.steps && formula.steps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Étapes de Résolution Détaillées
                  </div>

                  <div className="space-y-2.5">
                    {formula.steps.map((st, stIdx) => (
                      <div
                        key={stIdx}
                        className="rounded-xl bg-slate-800/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-mono text-xs font-bold text-indigo-400">
                            {st.step}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{st.title}</div>
                            {st.explanation && (
                              <p className="text-xs text-slate-400 mt-0.5">{st.explanation}</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-950 px-3.5 py-1.5 font-mono text-sm text-indigo-300 self-start md:self-auto">
                          <MathFormulaDisplay latex={st.latex} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. ONGLET GÉOMÉTRIE 2D/3D INTERACTIVE */}
      {(activeTab === "geometry" || (isSingleMode && hasGeometry)) && block.geometry && (
        <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                Figure Géométrique Interactive
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {block.geometry.title || `Figure : ${block.geometry.shapeType}`}
              </h3>
              {block.geometry.description && (
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">{block.geometry.description}</p>
              )}
            </div>

            {block.geometry.theorems && (
              <div className="flex flex-wrap gap-1.5">
                {block.geometry.theorems.map((th, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300"
                  >
                    {th}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Canevas SVG de la figure géométrique */}
          <div className="relative rounded-2xl bg-slate-950/90 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
            {block.geometry.svgCode ? (
              <div
                className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: block.geometry.svgCode }}
              />
            ) : block.geometry.shapeType === "right_triangle" || block.geometry.shapeType === "pythagoras" ? (
              /* Figure dynamique du Triangle Rectangle et Théorème de Pythagore */
              <svg viewBox="0 0 500 360" className="w-full max-w-lg h-auto select-none">
                <defs>
                  <linearGradient id={`gradHypo-${svgId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Grille cartésienne légère */}
                <g stroke="#334155" strokeWidth="0.5" opacity="0.3">
                  {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((x) => (
                    <line key={`x-${x}`} x1={x} y1="20" x2={x} y2="340" />
                  ))}
                  {[50, 100, 150, 200, 250, 300].map((y) => (
                    <line key={`y-${y}`} x1="20" y1={y} x2="480" y2={y} />
                  ))}
                </g>

                {/* Triangle Rectangle ABC */}
                {/* Sommet A (Angle Droit): (100, 280), Sommet B: (380, 280), Sommet C: (100, 80) */}
                <polygon
                  points="100,280 380,280 100,80"
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Symbole de l'Angle Droit en A */}
                <path d="M 100 256 L 124 256 L 124 280" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="112" cy="268" r="2.5" fill="#38bdf8" />

                {/* Arc d'angle en B (angle alpha) */}
                <path
                  d="M 340 280 A 40 40 0 0 0 355 258"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text x="325" y="272" fill="#f59e0b" fontSize="13" fontWeight="bold">α</text>

                {/* Côtés annotés */}
                {/* Côté adjacent b = 280px (horizontal) */}
                <text x="240" y="306" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Côté adjacent a (ex: 4 cm)
                </text>

                {/* Côté opposé a = 200px (vertical) */}
                <text
                  x="70"
                  y="180"
                  fill="#94a3b8"
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-90 70 180)"
                >
                  Côté opposé b (ex: 3 cm)
                </text>

                {/* Hypothénuse c */}
                <text
                  x="260"
                  y="165"
                  fill="#10b981"
                  fontSize="15"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-35.5 260 165)"
                >
                  Hypoténuse c = √(a² + b²) (ex: 5 cm)
                </text>

                {/* Sommets A, B, C */}
                <circle cx="100" cy="280" r="5" fill="#38bdf8" />
                <text x="85" y="298" fill="#38bdf8" fontSize="14" fontWeight="bold">A</text>

                <circle cx="380" cy="280" r="5" fill="#f59e0b" />
                <text x="395" y="285" fill="#f59e0b" fontSize="14" fontWeight="bold">B</text>

                <circle cx="100" cy="80" r="5" fill="#10b981" />
                <text x="90" y="68" fill="#10b981" fontSize="14" fontWeight="bold">C</text>
              </svg>
            ) : block.geometry.shapeType === "trig_circle" || block.geometry.shapeType === "circle" ? (
              /* Cercle Trigonométrique Unitaire Interactif */
              <svg viewBox="0 0 440 380" className="w-full max-w-md h-auto select-none">
                {/* Axes cartésiens */}
                <line x1="40" y1="190" x2="400" y2="190" stroke="#64748b" strokeWidth="1.5" />
                <line x1="220" y1="350" x2="220" y2="30" stroke="#64748b" strokeWidth="1.5" />

                {/* Flèches des axes */}
                <polygon points="400,190 392,185 392,195" fill="#64748b" />
                <polygon points="220,30 215,38 225,38" fill="#64748b" />
                <text x="395" y="180" fill="#94a3b8" fontSize="12" fontWeight="bold">cos θ (x)</text>
                <text x="230" y="42" fill="#94a3b8" fontSize="12" fontWeight="bold">sin θ (y)</text>

                {/* Cercle Unitaire R = 130 */}
                <circle
                  cx="220"
                  cy="190"
                  r="130"
                  fill="rgba(56, 189, 248, 0.06)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Angles remarquables 0, π/6, π/4, π/3, π/2 */}
                {/* Rayon à 45° (π/4) */}
                <line x1="220" y1="190" x2="311.9" y2="98.1" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="311.9" cy="98.1" r="5" fill="#f59e0b" />

                {/* Projections cos et sin */}
                <line x1="311.9" y1="98.1" x2="311.9" y2="190" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="311.9" y1="98.1" x2="220" y2="98.1" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,3" />

                <circle cx="311.9" cy="190" r="4" fill="#10b981" />
                <circle cx="220" cy="98.1" r="4" fill="#ec4899" />

                <text x="315" y="210" fill="#10b981" fontSize="11" fontWeight="bold">cos(π/4) = √2/2</text>
                <text x="125" y="95" fill="#ec4899" fontSize="11" fontWeight="bold">sin(π/4) = √2/2</text>
                <text x="325" y="90" fill="#f59e0b" fontSize="13" fontWeight="bold">M (θ = π/4)</text>

                {/* Graduations +1 et -1 */}
                <text x="355" y="180" fill="#cbd5e1" fontSize="11">1</text>
                <text x="75" y="180" fill="#cbd5e1" fontSize="11">-1</text>
                <text x="228" y="70" fill="#cbd5e1" fontSize="11">1</text>
                <text x="228" y="330" fill="#cbd5e1" fontSize="11">-1</text>
              </svg>
            ) : (
              /* Repère Cartésien & Polygone Général */
              <div className="text-center p-8 text-slate-400">
                <Compass className="h-12 w-12 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs">Visualisation géométrique de type : {block.geometry.shapeType}</p>
              </div>
            )}
          </div>

          {/* Propriétés Géométriques Clés */}
          {block.geometry.properties && block.geometry.properties.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {block.geometry.properties.map((prop, pIdx) => (
                <div key={pIdx} className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold">{prop.label}</div>
                  <div className="text-base font-mono font-bold text-emerald-400">{prop.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ONGLET GRAPHIQUE DE FONCTIONS MATHÉMATIQUES */}
      {(activeTab === "functionPlot" || (isSingleMode && hasPlot)) && block.functionPlot && plotData && (
        <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Tracé Graphique de Fonction f(x)
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {block.functionPlot.label} : f(x) = {block.functionPlot.fn}
              </h3>
              {block.functionPlot.description && (
                <p className="text-xs text-slate-300 mt-1">{block.functionPlot.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-500/20 px-3 py-1 font-mono text-xs font-bold text-sky-300">
                x ∈ [{plotData.xMin}, {plotData.xMax}]
              </span>
            </div>
          </div>

          {/* Canevas SVG du tracé de courbe */}
          <div className="relative rounded-2xl bg-slate-950/95 p-4 flex flex-col items-center justify-center overflow-hidden">
            {/* SVG Plotter 600x400 */}
            {(() => {
              const svgW = 640;
              const svgH = 380;
              const padX = 50;
              const padY = 40;
              const plotW = svgW - 2 * padX;
              const plotH = svgH - 2 * padY;

              const toSvgX = (x: number) =>
                padX + ((x - plotData.xMin) / (plotData.xMax - plotData.xMin)) * plotW;
              const toSvgY = (y: number) =>
                padY + ((plotData.yMax - y) / (plotData.yMax - plotData.yMin)) * plotH;

              // Axe X = 0 et Axe Y = 0
              const originX = toSvgX(0);
              const originY = toSvgY(0);

              // Points de la courbe en coordonnées SVG
              const pathString = plotData.points
                .map((pt, i) => `${i === 0 ? "M" : "L"} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
                .join(" ");

              const pathString2 =
                plotData.points2.length > 0
                  ? plotData.points2
                      .map((pt, i) => `${i === 0 ? "M" : "L"} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
                      .join(" ")
                  : null;

              return (
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full max-w-3xl h-auto select-none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * svgW;
                    const mathX =
                      plotData.xMin + ((mouseSvgX - padX) / plotW) * (plotData.xMax - plotData.xMin);
                    if (mathX >= plotData.xMin && mathX <= plotData.xMax) {
                      const mathY = evaluateMathFunction(block.functionPlot!.fn, mathX);
                      if (!Number.isNaN(mathY)) {
                        setHoveredPlotPoint({
                          x: Math.round(mathX * 100) / 100,
                          y: Math.round(mathY * 100) / 100,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => setHoveredPlotPoint(null)}
                >
                  {/* Grille cartésienne */}
                  <g stroke="#1e293b" strokeWidth="1">
                    {[-10, -8, -6, -4, -2, 2, 4, 6, 8, 10].map((gx) => {
                      if (gx < plotData.xMin || gx > plotData.xMax) return null;
                      const px = toSvgX(gx);
                      return <line key={`gx-${gx}`} x1={px} y1={padY} x2={px} y2={svgH - padY} />;
                    })}
                    {[-10, -5, 5, 10, 15, 20].map((gy) => {
                      if (gy < plotData.yMin || gy > plotData.yMax) return null;
                      const py = toSvgY(gy);
                      return <line key={`gy-${gy}`} x1={padX} y1={py} x2={svgW - padX} y2={py} />;
                    })}
                  </g>

                  {/* Axe X (Horizontal) */}
                  <line
                    x1={padX}
                    y1={originY >= padY && originY <= svgH - padY ? originY : svgH - padY}
                    x2={svgW - padX}
                    y2={originY >= padY && originY <= svgH - padY ? originY : svgH - padY}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* Axe Y (Vertical) */}
                  <line
                    x1={originX >= padX && originX <= svgW - padX ? originX : padX}
                    y1={padY}
                    x2={originX >= padX && originX <= svgW - padX ? originX : padX}
                    y2={svgH - padY}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* Graduations sur axe X */}
                  {[-6, -4, -2, 2, 4, 6].map((tx) => {
                    if (tx < plotData.xMin || tx > plotData.xMax) return null;
                    const px = toSvgX(tx);
                    const py = originY >= padY && originY <= svgH - padY ? originY : svgH - padY;
                    return (
                      <g key={`tx-${tx}`}>
                        <line x1={px} y1={py - 3} x2={px} y2={py + 3} stroke="#94a3b8" />
                        <text x={px} y={py + 15} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
                          {tx}
                        </text>
                      </g>
                    );
                  })}

                  {/* Courbe principale f(x) */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Courbe secondaire g(x) */}
                  {pathString2 && (
                    <path
                      d={pathString2}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Points clés remarquables (Zéros / Extremums) */}
                  {block.functionPlot.keyPoints?.map((kp, kIdx) => {
                    if (
                      kp.x < plotData.xMin ||
                      kp.x > plotData.xMax ||
                      kp.y < plotData.yMin ||
                      kp.y > plotData.yMax
                    )
                      return null;
                    const kx = toSvgX(kp.x);
                    const ky = toSvgY(kp.y);
                    const isRoot = kp.type === "root" || kp.y === 0;

                    return (
                      <g key={kIdx}>
                        <circle
                          cx={kx}
                          cy={ky}
                          r="5"
                          fill={isRoot ? "#10b981" : "#f59e0b"}
                          stroke="#020617"
                          strokeWidth="2"
                        />
                        <text
                          x={kx}
                          y={ky - 10}
                          fill={isRoot ? "#10b981" : "#f59e0b"}
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {kp.label} ({kp.x}, {kp.y})
                        </text>
                      </g>
                    );
                  })}

                  {/* Pointeur curseur interactif au survol de la souris */}
                  {hoveredPlotPoint && (
                    <g>
                      <line
                        x1={toSvgX(hoveredPlotPoint.x)}
                        y1={padY}
                        x2={toSvgX(hoveredPlotPoint.x)}
                        y2={svgH - padY}
                        stroke="#38bdf8"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                      <circle
                        cx={toSvgX(hoveredPlotPoint.x)}
                        cy={toSvgY(hoveredPlotPoint.y)}
                        r="6"
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  )}
                </svg>
              );
            })()}

            {/* Bulle flottante affichant la valeur au curseur */}
            <div className="mt-3 flex items-center justify-between w-full px-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-400"></span>
                Courbe : f(x) = {block.functionPlot.fn}
              </div>

              {hoveredPlotPoint ? (
                <div className="rounded-lg bg-sky-950/80 px-3 py-1 font-bold text-sky-300 border border-sky-500/30">
                  x = {hoveredPlotPoint.x} ➔ f(x) = {hoveredPlotPoint.y}
                </div>
              ) : (
                <div className="text-slate-500">
                  Survolez la courbe pour inspecter les coordonnées (x, f(x))
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. ONGLET TABLEUR & TABLE DE VALEURS */}
      {(activeTab === "spreadsheet" || (isSingleMode && hasSpreadsheet)) && block.spreadsheet && (
        <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TableIcon className="h-4 w-4" />
                Tableur &amp; Tableau de Calculs Mathématiques
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {block.spreadsheet.title || "Tableau de Données"}
              </h3>
              {block.spreadsheet.description && (
                <p className="text-xs text-slate-300 mt-1">{block.spreadsheet.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-amber-600/25 hover:bg-amber-500 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Exporter en CSV
              </button>
            </div>
          </div>

          {/* Recherche & Filtre dans le tableur */}
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Filtrer les lignes du tableur..."
              value={spreadsheetSearch}
              onChange={(e) => setSpreadsheetSearch(e.target.value)}
              className="rounded-xl bg-slate-950/80 px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800/80 focus:border-amber-500 focus:outline-none w-full max-w-xs"
            />
            <span className="text-xs font-mono text-slate-400">
              {block.spreadsheet.rows.length} enregistrements
            </span>
          </div>

          {/* Table interactive */}
          <div className="overflow-x-auto rounded-xl bg-slate-950/90">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-mono text-slate-500 w-12 text-center">#</th>
                  {block.spreadsheet.columns.map((col) => (
                    <th key={col.id} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white">{col.header}</span>
                        {col.formula && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 lowercase font-normal">
                            {col.formula}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {block.spreadsheet.rows
                  .filter((row) => {
                    if (!spreadsheetSearch.trim()) return true;
                    return Object.values(row).some((val) =>
                      String(val).toLowerCase().includes(spreadsheetSearch.toLowerCase())
                    );
                  })
                  .map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={cn(
                        "transition-colors hover:bg-slate-800/40",
                        rIdx % 2 === 1 && "bg-slate-900/30"
                      )}
                    >
                      <td className="px-3 py-2 text-center text-slate-500 text-[10px] select-none">
                        {rIdx + 1}
                      </td>
                      {block.spreadsheet!.columns.map((col) => (
                        <td key={col.id} className="px-4 py-2 text-slate-200">
                          {String(row[col.id] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Synthèse automatique des statistiques du tableur (Somme, Moyenne, Min, Max) */}
          {spreadsheetStats && Object.keys(spreadsheetStats).length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Statistiques Automatiques des Colonnes Numériques
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(spreadsheetStats).map(([colId, st]) => {
                  const col = block.spreadsheet!.columns.find((c) => c.id === colId);
                  return (
                    <div key={colId} className="rounded-xl bg-slate-800/40 p-3 space-y-1.5 text-xs">
                      <div className="font-bold text-white truncate">{col?.header || colId}</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500">Somme :</span> {st.sum}
                        </div>
                        <div>
                          <span className="text-slate-500">Moyenne :</span> {st.avg}
                        </div>
                        <div>
                          <span className="text-slate-500">Min :</span> {st.min}
                        </div>
                        <div>
                          <span className="text-slate-500">Max :</span> {st.max}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
