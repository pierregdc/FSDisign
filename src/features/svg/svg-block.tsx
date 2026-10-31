"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Eye,
  Palette,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot, type ViewportMode } from "@/features/canva";
import { cn } from "@/lib/utils";

type SvgBlockData = Extract<UIBlock, { type: "svg" }>;

function cleanSvgCode(raw: string): string {
  if (!raw) return "";
  let code = raw.trim();
  code = code.replace(/^```(?:svg|xml|html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  if (!code.includes('xmlns="http://www.w3.org/2000/svg"')) {
    code = code.replace(/<svg\b([^>]*)>/i, '<svg$1 xmlns="http://www.w3.org/2000/svg">');
  }
  if (!/viewBox=/i.test(code)) {
    code = code.replace(/<svg\b([^>]*)>/i, '<svg$1 viewBox="0 0 800 500">');
  }
  return code;
}

export function SvgBlockView({ block }: { block: SvgBlockData }) {
  const initialRawCode = block.code || (block as unknown as { svg?: string }).svg || "";
  const [currentCode, setCurrentCode] = useState(() => cleanSvgCode(initialRawCode));
  const [history, setHistory] = useState<string[]>([initialRawCode]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnimated, setIsAnimated] = useState(Boolean(block.animated));
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [selectedColor, setSelectedColor] = useState("#0284c7");

  const updateCode = (newCode: string) => {
    setCurrentCode(newCode);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentCode(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentCode(next);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveVersion = (name: string) => {
    const newVer: VersionSnapshot = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      data: currentCode,
    };
    setVersions([newVer, ...versions]);
  };

  const handleRestoreVersion = (ver: VersionSnapshot) => {
    if (typeof ver.data === "string") {
      updateCode(ver.data);
    }
  };

  // Ajout de formes vectorielles prédéfinies
  const addVectorShape = (shape: "rect" | "circle" | "arrow" | "text" | "gradient") => {
    let snippet = "";
    if (shape === "rect") {
      snippet = `\n  <rect x="60" y="60" width="140" height="80" rx="12" fill="${selectedColor}" fill-opacity="0.85" stroke="#ffffff" stroke-width="2" />`;
    } else if (shape === "circle") {
      snippet = `\n  <circle cx="120" cy="120" r="50" fill="${selectedColor}" fill-opacity="0.85" stroke="#ffffff" stroke-width="2" />`;
    } else if (shape === "arrow") {
      snippet = `\n  <g stroke="${selectedColor}" stroke-width="3" fill="none">\n    <line x1="50" y1="90" x2="180" y2="90" />\n    <polyline points="160,75 180,90 160,105" fill="${selectedColor}" />\n  </g>`;
    } else if (shape === "text") {
      snippet = `\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#ffffff">Élément Vectoriel</text>`;
    } else if (shape === "gradient") {
      const gradId = `grad_${Date.now()}`;
      snippet = `\n  <defs>\n    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="${selectedColor}" />\n      <stop offset="100%" stop-color="#6366f1" />\n    </linearGradient>\n  </defs>\n  <rect x="40" y="40" width="200" height="110" rx="16" fill="url(#${gradId})" />`;
    }

    const closeSvgMatch = currentCode.search(/<\/svg>/i);
    if (closeSvgMatch !== -1) {
      const updated = currentCode.slice(0, closeSvgMatch) + snippet + "\n" + currentCode.slice(closeSvgMatch);
      updateCode(updated);
    }
  };

  // Injection éventuelle de classes d'animation
  const displayCode = isAnimated
    ? currentCode.replace(
        /<svg\b([^>]*)>/i,
        (match, attrs) => {
          if (/class=["']/i.test(attrs)) {
            return match.replace(/class=["']([^"']*)["']/i, 'class="$1 transition-all duration-700 hover:scale-[1.01]"');
          }
          return `<svg${attrs} class="transition-all duration-700 hover:scale-[1.01]">`;
        }
      )
    : currentCode;

  const viewportWidthClass =
    viewport === "mobile"
      ? "max-w-[375px]"
      : viewport === "tablet"
        ? "max-w-[768px]"
        : "w-full";

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <CanvaToolbar
        title={block.title || "Graphisme Vectoriel SVG"}
        svgCode={currentCode}
        jsonData={block}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewport={viewport}
        onChangeViewport={setViewport}
        onSaveVersion={handleSaveVersion}
        versions={versions}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* En-tête sans contour général */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold tracking-tight text-white">
              {block.title || "Studio Graphique Vectoriel (SVG)"}
            </h3>
          </div>
          {block.description && (
            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-2xl">
              {block.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle Animation */}
          <button
            type="button"
            onClick={() => setIsAnimated(!isAnimated)}
            title="Activer/Désactiver les animations SVG"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all",
              isAnimated
                ? "border-sky-500/40 bg-sky-500/15 text-sky-400 font-semibold"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            )}
          >
            <Play className="h-3 w-3" />
            <span>Animation</span>
          </button>

          {/* Toggle Code / Aperçu */}
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all",
              showCode
                ? "border-sky-500/40 bg-sky-500/15 text-sky-400 font-semibold"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            )}
          >
            {showCode ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
            <span>{showCode ? "Aperçu visuel" : "Éditer le code SVG"}</span>
          </button>

          {/* Copier le code SVG */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copier le code SVG brut"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-xs font-medium text-slate-400 hover:text-white transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copié !" : "Copier SVG"}</span>
          </button>
        </div>
      </div>

      {/* Palette d'outils vectoriels rapides en capsule flottante */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900/60 px-4 py-2 border border-white/[0.05] backdrop-blur-md">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs mr-1">
          <Plus className="h-3.5 w-3.5 text-sky-400" />
          Ajouter forme :
        </span>
        <button
          type="button"
          onClick={() => addVectorShape("rect")}
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 transition-colors"
        >
          Rectangle
        </button>
        <button
          type="button"
          onClick={() => addVectorShape("circle")}
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 transition-colors"
        >
          Cercle
        </button>
        <button
          type="button"
          onClick={() => addVectorShape("arrow")}
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 transition-colors"
        >
          Flèche
        </button>
        <button
          type="button"
          onClick={() => addVectorShape("text")}
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 transition-colors"
        >
          Texte
        </button>
        <button
          type="button"
          onClick={() => addVectorShape("gradient")}
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 transition-colors"
        >
          Dégradé
        </button>

        <div className="ml-auto flex items-center gap-2 pl-3 border-l border-white/[0.08]">
          <Palette className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            title="Couleur des nouvelles formes"
            className="h-6 w-7 cursor-pointer rounded-md border border-slate-700 bg-transparent p-0"
          />
        </div>
      </div>

      {/* Zone de contenu principale : Rendu SVG ou Éditeur de code */}
      <div className="flex justify-center transition-all duration-300">
        <div className={cn("transition-all duration-300 w-full", viewportWidthClass)}>
          {showCode ? (
            <div className="space-y-2">
              <textarea
                value={currentCode}
                onChange={(e) => updateCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 outline-none focus:border-sky-500 shadow-inner"
              />
              <p className="text-[11px] text-slate-400">
                Modifiez le code SVG ci-dessus : le rendu visuel et les exports sont recalculés en direct.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
              <div
                className="w-full max-w-4xl overflow-auto flex justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:rounded-2xl [&>svg]:shadow-2xl [&>svg]:shadow-black/50"
                dangerouslySetInnerHTML={{ __html: displayCode }}
              />
            </div>
          )}
        </div>
      </div>

      {block.caption && (
        <p className="mt-2 text-center text-[11px] text-slate-400 italic">{block.caption}</p>
      )}
    </div>
  );
}
