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
  Search,
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
 * Nettoyage typographique pour rendre le LaTeX élégant et lisible sans syntaxe brute
 */
function formatLatexMinimal(raw: string): string {
  return raw
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\quad/g, "  ·  ")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\implies/g, " → ")
    .replace(/\\iff/g, " ⟺ ")
    .replace(/\\pm/g, "±")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\theta/g, "θ")
    .replace(/\\pi/g, "π")
    .replace(/_\{([^}]+)\}/g, "$1")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    .replace(/\\/g, "")
    .trim();
}

/**
 * Évaluateur mathématique sécurisé pour fonctions analytiques
 */
function evaluateMathFunction(expr: string, x: number): number {
  try {
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

export function MathBlockView({ block, defaultTab, className }: MathBlockProps) {
  const hasFormulas = Boolean(block.formulas && block.formulas.length > 0);
  const hasGeometry = Boolean(block.geometry);
  const hasPlot = Boolean(block.functionPlot);
  const hasSpreadsheet = Boolean(block.spreadsheet);

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
    link.download = `${block.title.toLowerCase().replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Tracé de courbe
  const plotData = useMemo(() => {
    if (!block.functionPlot) return null;
    const { fn, fn2, xMin = -4, xMax = 6, yMin: explicitYMin, yMax: explicitYMax } = block.functionPlot;

    const samples = 120;
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
    const margin = (computedYMax - computedYMin) * 0.1 || 1;
    const yMin = explicitYMin !== undefined ? explicitYMin : computedYMin - margin;
    const yMax = explicitYMax !== undefined ? explicitYMax : computedYMax + margin;

    return { points, points2, xMin, xMax, yMin, yMax };
  }, [block.functionPlot]);

  // ID SVG unique
  const svgId = useId().replace(/:/g, "");

  return (
    <div className={cn("w-full max-w-5xl space-y-6 text-slate-100 antialiased", className)}>
      {/* 1. EN-TÊTE MINIMALISTE ÉPURÉ */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tracking-wide">
              <span>Mathématiques</span>
              {block.topic && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="capitalize text-slate-300">{block.topic}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {block.title}
            </h2>
            {block.description && (
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-2xl">
                {block.description}
              </p>
            )}
          </div>

          {block.summary && (
            <div className="text-xs text-slate-300 bg-slate-900/60 rounded-xl p-3.5 max-w-xs leading-relaxed">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Synthèse</span>
              {block.summary}
            </div>
          )}
        </div>

        {/* NAVIGATION PAR ONGLETS MINIMALISTES */}
        {!isSingleMode && (
          <nav className="flex items-center gap-1 border-b border-slate-800/80 pt-2 pb-px text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                activeTab === "overview"
                  ? "border-slate-100 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              Aperçu
            </button>

            {hasFormulas && (
              <button
                type="button"
                onClick={() => setActiveTab("formulas")}
                className={cn(
                  "px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                  activeTab === "formulas"
                    ? "border-slate-100 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                Formules &amp; Étapes
                {block.formulas && (
                  <span className="text-[10px] text-slate-500 font-mono">({block.formulas.length})</span>
                )}
              </button>
            )}

            {hasGeometry && (
              <button
                type="button"
                onClick={() => setActiveTab("geometry")}
                className={cn(
                  "px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                  activeTab === "geometry"
                    ? "border-slate-100 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                Géométrie
              </button>
            )}

            {hasPlot && (
              <button
                type="button"
                onClick={() => setActiveTab("functionPlot")}
                className={cn(
                  "px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                  activeTab === "functionPlot"
                    ? "border-slate-100 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                Graphique
              </button>
            )}

            {hasSpreadsheet && (
              <button
                type="button"
                onClick={() => setActiveTab("spreadsheet")}
                className={cn(
                  "px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                  activeTab === "spreadsheet"
                    ? "border-slate-100 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                Tableur
              </button>
            )}
          </nav>
        )}
      </div>

      {/* 2. ONGLET APERÇU (OVERVIEW) — ÉPURÉ */}
      {activeTab === "overview" && !isSingleMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasFormulas && block.formulas?.[0] && (
            <div
              onClick={() => setActiveTab("formulas")}
              className="group cursor-pointer rounded-2xl bg-slate-900/40 p-5 hover:bg-slate-900/70 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Formule</span>
                <span className="text-[11px] group-hover:text-white transition-colors">Détails →</span>
              </div>
              <div className="font-serif italic text-xl text-slate-100 tracking-wide">
                {formatLatexMinimal(block.formulas[0].latex)}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{block.formulas[0].name}</p>
            </div>
          )}

          {hasGeometry && block.geometry && (
            <div
              onClick={() => setActiveTab("geometry")}
              className="group cursor-pointer rounded-2xl bg-slate-900/40 p-5 hover:bg-slate-900/70 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Figure géométrique</span>
                <span className="text-[11px] group-hover:text-white transition-colors">Explorer →</span>
              </div>
              <div className="text-sm font-medium text-slate-200">
                {block.geometry.title || "Triangle rectangle ABC"}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                {block.geometry.properties?.slice(0, 3).map((p, i) => (
                  <span key={i}>
                    {p.label}: <strong className="text-slate-200 font-normal">{p.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasPlot && block.functionPlot && (
            <div
              onClick={() => setActiveTab("functionPlot")}
              className="group cursor-pointer rounded-2xl bg-slate-900/40 p-5 hover:bg-slate-900/70 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Fonction</span>
                <span className="text-[11px] group-hover:text-white transition-colors">Tracé →</span>
              </div>
              <div className="font-serif italic text-lg text-slate-100">
                f(x) = {block.functionPlot.fn}
              </div>
              <div className="text-xs text-slate-400">
                Domaine d&apos;étude [{block.functionPlot.xMin}, {block.functionPlot.xMax}]
              </div>
            </div>
          )}

          {hasSpreadsheet && block.spreadsheet && (
            <div
              onClick={() => setActiveTab("spreadsheet")}
              className="group cursor-pointer rounded-2xl bg-slate-900/40 p-5 hover:bg-slate-900/70 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Tableur</span>
                <span className="text-[11px] group-hover:text-white transition-colors">Ouvrir →</span>
              </div>
              <div className="text-sm font-medium text-slate-200">
                {block.spreadsheet.title || "Table de calculs"}
              </div>
              <div className="text-xs text-slate-400">
                {block.spreadsheet.rows.length} lignes · {block.spreadsheet.columns.length} colonnes
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ONGLET FORMULES & ÉTAPES (MINIMALISTE & TYPOGRAPHIQUE) */}
      {(activeTab === "formulas" || (isSingleMode && hasFormulas)) && block.formulas && (
        <div className="space-y-6">
          {block.formulas.map((formula, idx) => (
            <div key={idx} className="rounded-2xl bg-slate-900/40 p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{formula.name}</h3>
                  {formula.explanation && (
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">{formula.explanation}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLatex(formula.latex)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLatex === formula.latex ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>LaTeX</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formule principale en typographie mathématique épurée */}
              <div className="py-4 text-center">
                <span className="font-serif italic text-2xl sm:text-3xl tracking-wide text-white">
                  {formatLatexMinimal(formula.latex)}
                </span>
              </div>

              {/* Variables (style minimaliste) */}
              {formula.variables && formula.variables.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] font-semibold text-slate-400 block">Paramètres</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {formula.variables.map((v, vIdx) => (
                      <span
                        key={vIdx}
                        className="rounded-lg bg-slate-800/40 px-2.5 py-1 text-slate-300 font-mono text-[11px]"
                      >
                        <strong className="text-white font-serif italic mr-1">{v.symbol}</strong>
                        {v.value ? `= ${v.value}` : `(${v.meaning})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Étapes pas à pas (délicat, sans code brut) */}
              {formula.steps && formula.steps.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800/60">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Étapes de résolution
                  </span>
                  <div className="space-y-2">
                    {formula.steps.map((st, stIdx) => (
                      <div
                        key={stIdx}
                        className="rounded-xl bg-slate-900/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-slate-500 font-mono text-[11px]">{st.step}.</span>
                          <div>
                            <span className="text-slate-200 font-medium">{st.title}</span>
                            {st.explanation && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{st.explanation}</p>
                            )}
                          </div>
                        </div>

                        <div className="font-serif italic text-sm text-slate-200 self-start sm:self-auto sm:text-right">
                          {formatLatexMinimal(st.latex)}
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

      {/* 4. ONGLET GÉOMÉTRIE (LIGNES FINES, DESIGN MINIMALISTE) */}
      {(activeTab === "geometry" || (isSingleMode && hasGeometry)) && block.geometry && (
        <div className="rounded-2xl bg-slate-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                {block.geometry.title || "Figure géométrique"}
              </h3>
              {block.geometry.description && (
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{block.geometry.description}</p>
              )}
            </div>

            {block.geometry.theorems && (
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                {block.geometry.theorems.map((th, i) => (
                  <span key={i} className="rounded-full bg-slate-800/60 px-2.5 py-0.5">
                    {th}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tracé géométrique vectoriel fin et épuré */}
          <div className="relative rounded-2xl bg-slate-950/60 p-4 sm:p-8 flex items-center justify-center min-h-[320px]">
            {block.geometry.svgCode ? (
              <div
                className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: block.geometry.svgCode }}
              />
            ) : block.geometry.shapeType === "right_triangle" || block.geometry.shapeType === "pythagoras" ? (
              <svg viewBox="0 0 520 340" className="w-full max-w-md h-auto select-none">
                {/* Grille fine et très discrète */}
                <g stroke="#334155" strokeWidth="0.5" opacity="0.15">
                  {[80, 160, 240, 320, 400, 480].map((x) => (
                    <line key={`x-${x}`} x1={x} y1="20" x2={x} y2="320" />
                  ))}
                  {[60, 120, 180, 240, 300].map((y) => (
                    <line key={`y-${y}`} x1="40" y1={y} x2="480" y2={y} />
                  ))}
                </g>

                {/* Triangle ABC avec lignes fines et gradient subtil */}
                <polygon
                  points="120,260 400,260 120,80"
                  fill="rgba(56, 189, 248, 0.05)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Symbole angle droit en A */}
                <path d="M 120 238 L 142 238 L 142 260" fill="none" stroke="#94a3b8" strokeWidth="1" />

                {/* Arc angle alpha en B */}
                <path d="M 365 260 A 35 35 0 0 0 376 244" fill="none" stroke="#f59e0b" strokeWidth="1" />
                <text x="350" y="254" fill="#f59e0b" fontSize="12" fontStyle="italic">α</text>

                {/* Côtés annotés délicatement */}
                <text x="260" y="280" fill="#94a3b8" fontSize="12" fontStyle="italic" textAnchor="middle">
                  a = 4 cm
                </text>
                <text x="95" y="175" fill="#94a3b8" fontSize="12" fontStyle="italic" textAnchor="middle">
                  b = 3 cm
                </text>
                <text
                  x="275"
                  y="160"
                  fill="#38bdf8"
                  fontSize="12"
                  fontWeight="500"
                  fontStyle="italic"
                  textAnchor="middle"
                  transform="rotate(-32.7 275 160)"
                >
                  c = √(a² + b²) = 5 cm
                </text>

                {/* Sommets A, B, C */}
                <circle cx="120" cy="260" r="3.5" fill="#ffffff" />
                <text x="105" y="275" fill="#e2e8f0" fontSize="12" fontWeight="600">A</text>

                <circle cx="400" cy="260" r="3.5" fill="#ffffff" />
                <text x="412" y="265" fill="#e2e8f0" fontSize="12" fontWeight="600">B</text>

                <circle cx="120" cy="80" r="3.5" fill="#ffffff" />
                <text x="110" y="70" fill="#e2e8f0" fontSize="12" fontWeight="600">C</text>
              </svg>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Figure géométrique : {block.geometry.shapeType}
              </div>
            )}
          </div>

          {/* Propriétés présentées sous forme de liste épurée */}
          {block.geometry.properties && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {block.geometry.properties.map((p, i) => (
                <div key={i} className="text-xs">
                  <span className="text-slate-400 block text-[11px]">{p.label}</span>
                  <span className="font-mono text-slate-200 font-medium">{p.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. ONGLET GRAPHIQUE DE FONCTION (ÉPURÉ, PAS DE TEXTE QUI DÉPASSE) */}
      {(activeTab === "functionPlot" || (isSingleMode && hasPlot)) && block.functionPlot && plotData && (
        <div className="rounded-2xl bg-slate-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                {block.functionPlot.label || `f(x) = ${block.functionPlot.fn}`}
              </h3>
              {block.functionPlot.description && (
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{block.functionPlot.description}</p>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              x ∈ [{plotData.xMin}, {plotData.xMax}]
            </div>
          </div>

          {/* Tracé SVG ultra-minimaliste */}
          <div className="relative rounded-2xl bg-slate-950/60 p-4 flex flex-col items-center justify-center">
            {(() => {
              const svgW = 600;
              const svgH = 320;
              const padX = 40;
              const padY = 30;
              const plotW = svgW - 2 * padX;
              const plotH = svgH - 2 * padY;

              const toSvgX = (x: number) =>
                padX + ((x - plotData.xMin) / (plotData.xMax - plotData.xMin)) * plotW;
              const toSvgY = (y: number) =>
                padY + ((plotData.yMax - y) / (plotData.yMax - plotData.yMin)) * plotH;

              const originX = toSvgX(0);
              const originY = toSvgY(0);

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
                  className="w-full max-w-2xl h-auto select-none"
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
                  {/* Grille fine discrète */}
                  <g stroke="#334155" strokeWidth="0.5" opacity="0.12">
                    {[-10, -6, -4, -2, 2, 4, 6, 8, 10].map((gx) => {
                      if (gx < plotData.xMin || gx > plotData.xMax) return null;
                      const px = toSvgX(gx);
                      return <line key={`gx-${gx}`} x1={px} y1={padY} x2={px} y2={svgH - padY} />;
                    })}
                    {[-5, 5, 10, 15].map((gy) => {
                      if (gy < plotData.yMin || gy > plotData.yMax) return null;
                      const py = toSvgY(gy);
                      return <line key={`gy-${gy}`} x1={padX} y1={py} x2={svgW - padX} y2={py} />;
                    })}
                  </g>

                  {/* Axe X */}
                  <line
                    x1={padX}
                    y1={originY >= padY && originY <= svgH - padY ? originY : svgH - padY}
                    x2={svgW - padX}
                    y2={originY >= padY && originY <= svgH - padY ? originY : svgH - padY}
                    stroke="#475569"
                    strokeWidth="1"
                  />

                  {/* Axe Y */}
                  <line
                    x1={originX >= padX && originX <= svgW - padX ? originX : padX}
                    y1={padY}
                    x2={originX >= padX && originX <= svgW - padX ? originX : padX}
                    y2={svgH - padY}
                    stroke="#475569"
                    strokeWidth="1"
                  />

                  {/* Graduations calmes */}
                  {[-2, 0, 2, 4, 6].map((tx) => {
                    if (tx < plotData.xMin || tx > plotData.xMax) return null;
                    const px = toSvgX(tx);
                    const py = originY >= padY && originY <= svgH - padY ? originY : svgH - padY;
                    return (
                      <text
                        key={`tx-${tx}`}
                        x={px}
                        y={py + 14}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {tx}
                      </text>
                    );
                  })}

                  {/* Courbe principale f(x) */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Courbe secondaire f'(x) */}
                  {pathString2 && (
                    <path
                      d={pathString2}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                      opacity="0.8"
                    />
                  )}

                  {/* Points clés positionnés de manière aérée */}
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
                        <circle cx={kx} cy={ky} r="3.5" fill={isRoot ? "#34d399" : "#f59e0b"} />
                        <text
                          x={kx}
                          y={ky > svgH / 2 ? ky + 14 : ky - 8}
                          fill="#cbd5e1"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          ({kp.x}, {kp.y})
                        </text>
                      </g>
                    );
                  })}

                  {/* Indicateur de survol */}
                  {hoveredPlotPoint && (
                    <g>
                      <circle
                        cx={toSvgX(hoveredPlotPoint.x)}
                        cy={toSvgY(hoveredPlotPoint.y)}
                        r="4"
                        fill="#38bdf8"
                      />
                    </g>
                  )}
                </svg>
              );
            })()}

            <div className="mt-2 text-xs font-mono text-slate-400">
              {hoveredPlotPoint ? (
                <span className="text-sky-300">
                  x = {hoveredPlotPoint.x} · f(x) = {hoveredPlotPoint.y}
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">
                  f(x) = {block.functionPlot.fn} · f&apos;(x) = 2x − 4
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. ONGLET TABLEUR (ÉPURÉ, TYPE NOTION / AIRTABLE) */}
      {(activeTab === "spreadsheet" || (isSingleMode && hasSpreadsheet)) && block.spreadsheet && (
        <div className="rounded-2xl bg-slate-900/40 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                {block.spreadsheet.title || "Tableur de valeurs"}
              </h3>
              {block.spreadsheet.description && (
                <p className="text-xs text-slate-400 mt-0.5">{block.spreadsheet.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>
          </div>

          {/* Recherche sobre */}
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher une valeur..."
              value={spreadsheetSearch}
              onChange={(e) => setSpreadsheetSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full max-w-xs"
            />
          </div>

          {/* Tableau fin et sobre */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800/80 text-[11px] font-medium text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center font-mono text-slate-600">#</th>
                  {block.spreadsheet.columns.map((col) => (
                    <th key={col.id} className="py-2.5 px-3 font-normal">
                      <span>{col.header}</span>
                      {col.formula && (
                        <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                          {col.formula}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-xs">
                {block.spreadsheet.rows
                  .filter((row) => {
                    if (!spreadsheetSearch.trim()) return true;
                    return Object.values(row).some((val) =>
                      String(val).toLowerCase().includes(spreadsheetSearch.toLowerCase())
                    );
                  })
                  .map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-600 text-[10px]">
                        {rIdx + 1}
                      </td>
                      {block.spreadsheet!.columns.map((col) => (
                        <td key={col.id} className="py-2 px-3 text-slate-200">
                          {String(row[col.id] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
