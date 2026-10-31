"use client";

import { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Download,
  History,
  Monitor,
  Printer,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import {
  exportInteractiveHtml,
  exportJson,
  exportSvgString,
  exportSvgToRaster,
  exportToPdfPrint,
  type ImageFormat,
} from "@/lib/canva-export";
import { cn } from "@/lib/utils";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export type VersionSnapshot = {
  id: string;
  name: string;
  timestamp: number;
  data: unknown;
};

export function CanvaToolbar({
  title,
  svgCode,
  jsonData,
  htmlContent,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  viewport = "desktop",
  onChangeViewport,
  onSaveVersion,
  versions = [],
  onRestoreVersion,
  onExportCustomRaster,
  className,
}: {
  title: string;
  svgCode?: string;
  jsonData?: unknown;
  htmlContent?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  viewport?: ViewportMode;
  onChangeViewport?: (mode: ViewportMode) => void;
  onSaveVersion?: (name: string) => void;
  versions?: VersionSnapshot[];
  onRestoreVersion?: (version: VersionSnapshot) => void;
  onExportCustomRaster?: (format: ImageFormat) => Promise<void> | void;
  className?: string;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleExport = async (format: "svg" | ImageFormat | "pdf" | "html" | "json") => {
    setExportOpen(false);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);

    const safeTitle = title || "creation-canva";

    try {
      if (format === "svg") {
        if (svgCode) {
          exportSvgString(svgCode, safeTitle);
        } else {
          exportJson(jsonData, safeTitle);
        }
      } else if (format === "png" || format === "jpg" || format === "webp") {
        if (onExportCustomRaster) {
          await onExportCustomRaster(format);
        } else if (svgCode) {
          await exportSvgToRaster(svgCode, safeTitle, format);
        } else {
          exportJson(jsonData, safeTitle);
        }
      } else if (format === "pdf") {
        exportToPdfPrint();
      } else if (format === "html") {
        const body = htmlContent || (svgCode ? `<div class="flex justify-center p-4">${svgCode}</div>` : `<pre class="p-4 bg-slate-100 rounded-lg text-xs overflow-auto">${JSON.stringify(jsonData, null, 2)}</pre>`);
        exportInteractiveHtml(safeTitle, body, safeTitle);
      } else if (format === "json") {
        exportJson(jsonData || { title, svg: svgCode }, safeTitle);
      }
    } catch (err) {
      console.error("Erreur d'export:", err);
    }
  };

  const handleCreateVersion = () => {
    if (!versionName.trim() || !onSaveVersion) return;
    onSaveVersion(versionName.trim());
    setVersionName("");
  };

  return (
    <div
      className={cn(
        "no-print flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/40 bg-panel/60 px-3 py-1.5 text-xs text-muted backdrop-blur-md",
        className
      )}
    >
      {/* Historique : Annuler / Rétablir */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
          aria-label="Annuler la modification"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card hover:bg-ink/[0.05] disabled:cursor-not-allowed disabled:opacity-35 transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rétablir (Ctrl+Y)"
          aria-label="Rétablir la modification"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card hover:bg-ink/[0.05] disabled:cursor-not-allowed disabled:opacity-35 transition-colors"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Sélecteur de viewport responsive */}
      {onChangeViewport && (
        <div className="flex items-center gap-0.5 rounded-lg border border-line bg-card p-0.5">
          <button
            type="button"
            onClick={() => onChangeViewport("desktop")}
            title="Aperçu Desktop (Plein écran)"
            className={cn(
              "flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
              viewport === "desktop"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <Monitor className="h-3 w-3" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport("tablet")}
            title="Aperçu Tablette (768px)"
            className={cn(
              "flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
              viewport === "tablet"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <Tablet className="h-3 w-3" />
            <span className="hidden sm:inline">Tablette</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport("mobile")}
            title="Aperçu Mobile (375px)"
            className={cn(
              "flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
              viewport === "mobile"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <Smartphone className="h-3 w-3" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      )}

      {/* Actions : Impression, Versions, Exports */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={exportToPdfPrint}
          title="Prévisualisation avant impression ou export PDF vectoriel"
          className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-card px-2 text-[11px] font-medium hover:bg-ink/[0.05] transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Imprimer</span>
        </button>

        {/* Modal de versions */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setVersionOpen(!versionOpen);
              setExportOpen(false);
            }}
            title="Enregistrer ou restaurer une version"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-card px-2 text-[11px] font-medium hover:bg-ink/[0.05] transition-colors"
          >
            <History className="h-3.5 w-3.5 text-accent" />
            <span className="hidden md:inline">Versions</span>
            {versions.length > 0 && (
              <span className="ml-0.5 rounded-full bg-accent/15 px-1 py-0.2 text-[9px] font-bold text-accent">
                {versions.length}
              </span>
            )}
          </button>

          {versionOpen && (
            <div className="absolute right-0 z-50 mt-1 w-64 rounded-xl border border-line bg-panel p-3 shadow-xl animate-fade-in">
              <p className="mb-2 text-xs font-semibold text-ink">Gestion des versions</p>
              {onSaveVersion && (
                <div className="mb-3 flex gap-1">
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="Nom du point d'étape..."
                    className="w-full rounded-md border border-line bg-card px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleCreateVersion}
                    disabled={!versionName.trim()}
                    className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="max-h-40 space-y-1 overflow-y-auto">
                {versions.length === 0 ? (
                  <p className="text-[11px] text-faint">Aucune version enregistrée.</p>
                ) : (
                  versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="flex items-center justify-between rounded-md p-1.5 hover:bg-ink/[0.05] transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-medium text-ink">{ver.name}</p>
                        <p className="text-[10px] text-faint">
                          {new Date(ver.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {onRestoreVersion && (
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreVersion(ver);
                            setVersionOpen(false);
                          }}
                          className="text-[10px] text-accent hover:underline font-semibold"
                        >
                          Restaurer
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Déroulant d'Exports */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setExportOpen(!exportOpen);
              setVersionOpen(false);
            }}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-accent px-2.5 text-[11px] font-semibold text-white shadow-xs hover:bg-accent-strong transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exporter</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border border-line bg-panel p-1.5 shadow-2xl animate-fade-in">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Formats d&apos;export réels
              </p>
              {svgCode && (
                <button
                  type="button"
                  onClick={() => handleExport("svg")}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <span className="font-medium">Fichier SVG (.svg)</span>
                  {copiedFormat === "svg" && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleExport("png")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Image PNG HD (.png)</span>
                {copiedFormat === "png" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => handleExport("jpg")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Image JPG (.jpg)</span>
                {copiedFormat === "jpg" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => handleExport("webp")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Image WebP (.webp)</span>
                {copiedFormat === "webp" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => handleExport("html")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Application HTML (.html)</span>
                {copiedFormat === "html" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Structure JSON (.json)</span>
                {copiedFormat === "json" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <span className="font-medium">Impression / PDF (.pdf)</span>
                {copiedFormat === "pdf" && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
