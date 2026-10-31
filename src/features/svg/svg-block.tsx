"use client";

import { useState } from "react";
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
  const [currentCode, setCurrentCode] = useState(() => cleanSvgCode(block.code));
  const [history, setHistory] = useState<string[]>([block.code]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnimated, setIsAnimated] = useState(Boolean(block.animated));
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [selectedColor, setSelectedColor] = useState("#0139b7");

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
      snippet = `\n  <rect x="50" y="50" width="120" height="80" rx="8" fill="${selectedColor}" fill-opacity="0.8" stroke="#ffffff" stroke-width="2" />`;
    } else if (shape === "circle") {
      snippet = `\n  <circle cx="100" cy="100" r="45" fill="${selectedColor}" fill-opacity="0.8" stroke="#ffffff" stroke-width="2" />`;
    } else if (shape === "arrow") {
      snippet = `\n  <g stroke="${selectedColor}" stroke-width="3" fill="none">\n    <line x1="40" y1="80" x2="160" y2="80" />\n    <polyline points="140,65 160,80 140,95" fill="${selectedColor}" />\n  </g>`;
    } else if (shape === "text") {
      snippet = `\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="${selectedColor}">Texte Vectoriel</text>`;
    } else if (shape === "gradient") {
      snippet = `\n  <defs>\n    <linearGradient id="grad_${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="${selectedColor}" />\n      <stop offset="100%" stop-color="#ff3366" />\n    </linearGradient>\n  </defs>\n  <rect x="30" y="30" width="180" height="100" rx="12" fill="url(#grad_${Date.now()})" />`;
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
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
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

      {/* En-tête du bloc SVG */}
      <div className="rounded-2xl border-0 bg-transparent p-0 sm:p-1 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              {block.title || "Studio Graphique Vectoriel (SVG)"}
            </h3>
            {block.description && (
              <p className="mt-0.5 text-xs text-muted leading-relaxed">{block.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Animation */}
            <button
              type="button"
              onClick={() => setIsAnimated(!isAnimated)}
              title="Activer/Désactiver les animations SVG"
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors",
                isAnimated
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-line bg-panel text-muted hover:text-ink"
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
                "inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors",
                showCode
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-line bg-panel text-muted hover:text-ink"
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
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-panel px-2.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copié !" : "Copier SVG"}</span>
            </button>
          </div>
        </div>

        {/* Palette d'outils vectoriels rapides */}
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-panel/70 p-2 text-xs border border-line">
          <span className="font-semibold text-ink flex items-center gap-1 text-[11px]">
            <Plus className="h-3.5 w-3.5 text-accent" />
            Ajouter forme :
          </span>
          <button
            type="button"
            onClick={() => addVectorShape("rect")}
            className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] hover:border-accent hover:text-accent transition-colors"
          >
            Rectangle
          </button>
          <button
            type="button"
            onClick={() => addVectorShape("circle")}
            className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] hover:border-accent hover:text-accent transition-colors"
          >
            Cercle
          </button>
          <button
            type="button"
            onClick={() => addVectorShape("arrow")}
            className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] hover:border-accent hover:text-accent transition-colors"
          >
            Flèche
          </button>
          <button
            type="button"
            onClick={() => addVectorShape("text")}
            className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] hover:border-accent hover:text-accent transition-colors"
          >
            Texte
          </button>
          <button
            type="button"
            onClick={() => addVectorShape("gradient")}
            className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] hover:border-accent hover:text-accent transition-colors"
          >
            Dégradé
          </button>

          <div className="ml-auto flex items-center gap-1.5 pl-2 border-l border-line">
            <Palette className="h-3.5 w-3.5 text-muted" />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              title="Couleur des nouvelles formes"
              className="h-5 w-6 cursor-pointer rounded border border-line bg-transparent p-0"
            />
          </div>
        </div>

        {/* Zone de contenu principale : Rendu SVG ou Éditeur de code */}
        <div className="flex justify-center transition-all duration-300">
          <div className={cn("transition-all duration-300", viewportWidthClass)}>
            {showCode ? (
              <div className="relative">
                <textarea
                  value={currentCode}
                  onChange={(e) => updateCode(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full rounded-xl border border-line bg-slate-900 p-3.5 font-mono text-xs text-emerald-400 outline-none focus:border-accent"
                />
                <p className="mt-1 text-[11px] text-faint">
                  Modifiez le code SVG ci-dessus : le rendu visuel et les exports sont recalculés en direct.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-0 bg-transparent p-2 sm:p-4 overflow-hidden">
                <div
                  className="max-w-full overflow-auto flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: displayCode }}
                />
              </div>
            )}
          </div>
        </div>

        {block.caption && (
          <p className="mt-3 text-center text-[11px] text-faint italic">{block.caption}</p>
        )}
      </div>
    </div>
  );
}
