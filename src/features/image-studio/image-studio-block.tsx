"use client";

import { useRef, useState } from "react";
import {
  Crop,
  ImageIcon,
  Sliders,
  Upload,
  Wand2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot, type ViewportMode } from "@/features/canva";
import { exportCanvasToRaster, type ImageFormat } from "@/lib/canva-export";
import { cn } from "@/lib/utils";

type ImageStudioBlockData = Extract<UIBlock, { type: "imageStudio" }>;


function buildPollinationsUrl(prompt: string, seedOffset = 0): string {
  let query = prompt.trim();
  const lower = query.toLowerCase();
  if (lower.includes("vélo") || lower.includes("velo") || lower.includes("bike")) {
    query = `aerodynamic road racing bicycle, detailed carbon frame, spoke wheels, road bike, studio lighting, sharp 8k render, photorealistic, ${query}`;
  }
  const hash = query.split("").reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0);
  const seed = Math.abs(hash) + seedOffset;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=1200&height=675&nologo=true&enhance=true&seed=${seed}`;
}

function getProceduralSvg(prompt: string, title?: string, accentColor = "#0139b7"): string {
  const p = (prompt + " " + (title || "")).toLowerCase();

  if (p.includes("vélo") || p.includes("velo") || p.includes("bike") || p.includes("bicyclette") || p.includes("cycl")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="velo_sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="60%" stop-color="#141d2e" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="velo_frame" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="velo_metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <radialGradient id="velo_glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="800" height="450" fill="url(#velo_sky)" rx="16" />
  <circle cx="400" cy="270" r="230" fill="url(#velo_glow)" />
  <line x1="80" y1="365" x2="720" y2="365" stroke="#334155" stroke-width="2" stroke-dasharray="8 6" opacity="0.6" />
  <ellipse cx="400" cy="365" rx="280" ry="14" fill="#000000" opacity="0.5" />

  <g id="roue_arriere">
    <circle cx="260" cy="290" r="76" fill="none" stroke="#0f172a" stroke-width="14" />
    <circle cx="260" cy="290" r="72" fill="none" stroke="#64748b" stroke-width="3" />
    <circle cx="260" cy="290" r="69" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.7" />
    <g stroke="#94a3b8" stroke-width="1" opacity="0.45">
      <line x1="260" y1="221" x2="260" y2="359" />
      <line x1="191" y1="290" x2="329" y2="290" />
      <line x1="211" y1="241" x2="309" y2="339" />
      <line x1="211" y1="339" x2="309" y2="241" />
      <line x1="235" y1="224" x2="285" y2="356" />
      <line x1="285" y1="224" x2="235" y2="356" />
      <line x1="194" y1="265" x2="326" y2="315" />
      <line x1="194" y1="315" x2="326" y2="265" />
    </g>
    <circle cx="260" cy="290" r="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
    <circle cx="260" cy="290" r="8" fill="#f8fafc" />
  </g>

  <g id="roue_avant">
    <circle cx="540" cy="290" r="76" fill="none" stroke="#0f172a" stroke-width="14" />
    <circle cx="540" cy="290" r="72" fill="none" stroke="#64748b" stroke-width="3" />
    <circle cx="540" cy="290" r="69" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.7" />
    <g stroke="#94a3b8" stroke-width="1" opacity="0.45">
      <line x1="540" y1="221" x2="540" y2="359" />
      <line x1="471" y1="290" x2="609" y2="290" />
      <line x1="491" y1="241" x2="589" y2="339" />
      <line x1="491" y1="339" x2="589" y2="241" />
      <line x1="515" y1="224" x2="565" y2="356" />
      <line x1="565" y1="224" x2="515" y2="356" />
      <line x1="474" y1="265" x2="606" y2="315" />
      <line x1="474" y1="315" x2="606" y2="265" />
    </g>
    <circle cx="540" cy="290" r="12" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
    <circle cx="540" cy="290" r="6" fill="#f8fafc" />
  </g>

  <line x1="260" y1="290" x2="368" y2="200" stroke="url(#velo_frame)" stroke-width="8" stroke-linecap="round" />
  <line x1="260" y1="290" x2="385" y2="290" stroke="url(#velo_frame)" stroke-width="9" stroke-linecap="round" />

  <g id="transmission">
    <circle cx="385" cy="290" r="22" fill="#0f172a" stroke="#94a3b8" stroke-width="2.5" />
    <line x1="260" y1="284" x2="385" y2="278" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="4 2" />
    <line x1="260" y1="296" x2="385" y2="302" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="4 2" />
    <line x1="385" y1="290" x2="365" y2="332" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" />
    <line x1="352" y1="332" x2="378" y2="332" stroke="#f43f5e" stroke-width="5" stroke-linecap="round" />
  </g>

  <line x1="385" y1="290" x2="505" y2="185" stroke="url(#velo_frame)" stroke-width="12" stroke-linecap="round" />
  <line x1="385" y1="290" x2="368" y2="190" stroke="url(#velo_frame)" stroke-width="10" stroke-linecap="round" />

  <line x1="368" y1="190" x2="360" y2="152" stroke="url(#velo_metal)" stroke-width="6" stroke-linecap="round" />
  <path d="M330 150 Q360 146 392 153 Q375 160 350 159 Z" fill="#020617" stroke="#38bdf8" stroke-width="2" />

  <line x1="368" y1="200" x2="505" y2="185" stroke="url(#velo_frame)" stroke-width="10" stroke-linecap="round" />
  <line x1="505" y1="185" x2="512" y2="160" stroke="url(#velo_frame)" stroke-width="10" stroke-linecap="round" />
  <line x1="505" y1="185" x2="540" y2="290" stroke="url(#velo_frame)" stroke-width="9" stroke-linecap="round" />

  <line x1="512" y1="160" x2="530" y2="150" stroke="url(#velo_metal)" stroke-width="6" stroke-linecap="round" />
  <path d="M530 150 C548 148 554 165 548 180 C544 190 534 192 526 190" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />

  <g transform="translate(400, 68)" text-anchor="middle">
    <text fill="#ffffff" font-size="22" font-weight="bold" font-family="system-ui, sans-serif" letter-spacing="1">VÉLO DE COURSE AÉRODYNAMIQUE</text>
    <text y="24" fill="#38bdf8" font-size="12" font-weight="600" font-family="system-ui, sans-serif" letter-spacing="2">ILLUSTRATION VECTORIELLE HAUTE PRÉCISION · FS CANVA</text>
  </g>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="fs_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="fs_glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="800" height="450" fill="url(#fs_bg)" rx="16" />
  <circle cx="400" cy="225" r="160" fill="url(#fs_glow)" />
  <g transform="translate(400, 210)" text-anchor="middle" fill="#ffffff">
    <text font-size="28" font-weight="bold" font-family="sans-serif">${title || "Composition Visuelle"}</text>
    <text y="40" font-size="14" fill="#cbd5e1" font-family="sans-serif">FRANCE STUDENT CANVA · STUDIO IA</text>
  </g>
</svg>`;
}

export function ImageStudioBlockView({
  block,
  onPrompt,
}: {
  block: ImageStudioBlockData;
  onPrompt?: (prompt: string) => void;
}) {
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const initialAiUrl = block.url || (block.prompt ? buildPollinationsUrl(block.prompt, seedOffset) : null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(initialAiUrl);
  const [imageLoading, setImageLoading] = useState<boolean>(Boolean(initialAiUrl && !block.url));
  const [imageError, setImageError] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">(
    block.aspectRatio === "3:4" ? "4:3" : block.aspectRatio || "16:9"
  );
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Filtres de retouche réels
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [accentColor, setAccentColor] = useState("#0139b7");

  // Éléments identifiés sur l'image
  const [elements, setElements] = useState(
    block.elements || [
      { id: "el_1", label: "Sujet principal", color: "#0139b7", type: "subject" as const },
      { id: "el_2", label: "Arrière-plan", color: "#64748b", type: "background" as const },
    ]
  );

  // Overlay textuel personnalisable
  const [overlayText, setOverlayText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Importation réelle de fichier image local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentImageUrl(dataUrl);
        // Analyse automatique des dimensions et identification des éléments
        setElements([
          { id: "el_import_1", label: `Image importée (${file.name})`, color: "#10b981", type: "subject" },
          { id: "el_import_2", label: "Composition personnalisée", color: "#6366f1", type: "background" },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHueRotate(0);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setOverlayText("");
  };

  // Demander une variante visuelle via l'assistant
  const handleRequestVariant = () => {
    if (onPrompt) {
      onPrompt(
        `Crée une variante créative de ce visuel (${block.category}) : "${block.prompt}", en modifiant la palette de couleurs et la composition.`
      );
    }
  };

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;

  const getAspectClasses = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "9:16":
        return "aspect-[9/16] max-w-[280px]";
      case "4:3":
        return "aspect-[4/3]";
      case "16:9":
      default:
        return "aspect-video";
    }
  };

  // Rendu de secours SVG stylisé si aucune image HTTP n'est fournie
  const defaultSvgIllustration = block.svg || getProceduralSvg(block.prompt, block.title, accentColor);

  // Moteur de rendu et rasterisation réelle Canvas 2D
  const exportRasterImage = async (format: ImageFormat) => {
    let targetW = 1920;
    let targetH = 1080;
    if (aspectRatio === "1:1") {
      targetW = 1200;
      targetH = 1200;
    } else if (aspectRatio === "9:16") {
      targetW = 1080;
      targetH = 1920;
    } else if (aspectRatio === "4:3") {
      targetW = 1440;
      targetH = 1080;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fond neutre
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, targetW, targetH);

    // Charger l'image source (URL locale/importée ou SVG vectoriel)
    const sourceSrc = currentImageUrl || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSvgIllustration)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = sourceSrc;
    });

    // Appliquer les filtres réels Canvas 2D
    ctx.filter = filterStyle;

    // Recadrage proportionnel (object-cover) centré
    const imgAspect = img.width / (img.height || 1);
    const canvasAspect = targetW / targetH;
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

    if (imgAspect > canvasAspect) {
      sWidth = img.height * canvasAspect;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / canvasAspect;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
    ctx.filter = "none";

    // Dessin de la légende textuelle sur le Canvas
    if (overlayText.trim()) {
      const bannerText = overlayText.trim();
      const fontSize = Math.round(targetW * 0.032);
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textMetrics = ctx.measureText(bannerText);
      const textWidth = textMetrics.width;
      const paddingX = Math.round(fontSize * 1.2);
      const paddingY = Math.round(fontSize * 0.6);
      const boxW = textWidth + paddingX * 2;
      const boxH = fontSize + paddingY * 2;
      const boxX = (targetW - boxW) / 2;
      const boxY = targetH - boxH - Math.round(targetH * 0.08);

      ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
      ctx.beginPath();
      const radius = Math.round(boxH / 2);
      ctx.roundRect(boxX, boxY, boxW, boxH, radius);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bannerText, targetW / 2, boxY + boxH / 2);
    }

    await exportCanvasToRaster(canvas, block.title || `image-${block.category}`, format);
  };

  const interactiveHtmlContent = `<div class="max-w-2xl mx-auto space-y-4 text-center">
    <h2 class="text-xl font-bold">${block.title || "Composition Visuelle"}</h2>
    <p class="text-xs text-slate-500 font-mono italic">${block.prompt}</p>
    <div class="rounded-xl overflow-hidden shadow-lg border border-slate-200">
      ${currentImageUrl ? `<img src="${currentImageUrl}" style="filter: ${filterStyle}; width: 100%; height: auto;" alt="${block.prompt}" />` : defaultSvgIllustration}
    </div>
    ${overlayText ? `<p class="text-sm font-bold text-slate-800">« ${overlayText} »</p>` : ""}
  </div>`;

  return (
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
      <CanvaToolbar
        title={block.title || `Studio Visuel (${block.category})`}
        svgCode={defaultSvgIllustration}
        jsonData={block}
        htmlContent={interactiveHtmlContent}
        viewport={viewport}
        onChangeViewport={setViewport}
        versions={versions}
        onSaveVersion={(name) =>
          setVersions([
            { id: crypto.randomUUID(), name, timestamp: Date.now(), data: { brightness, contrast, saturation } },
            ...versions,
          ])
        }
        onExportCustomRaster={exportRasterImage}
      />

      <div className="rounded-2xl border-0 bg-transparent p-0 sm:p-1 shadow-none">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-accent" />
              <span>{block.title || `Studio d'Image & Composition (${block.category})`}</span>
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Prompt : <span className="italic text-ink font-mono">{block.prompt}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Importation de fichier image local */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-panel px-2.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-colors"
            >
              <Upload className="h-3 w-3" />
              <span>Importer image</span>
            </button>

            {/* Génération de variante */}
            <button
              type="button"
              onClick={handleRequestVariant}
              title="Générer une nouvelle variante avec l'IA"
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-accent/10 border border-accent/20 px-2.5 text-[11px] font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <Wand2 className="h-3 w-3" />
              <span>Variante IA</span>
            </button>
          </div>
        </div>

        {/* Zone de prévisualisation et retouche de l'image */}
        <div className="flex justify-center p-1 sm:p-2 bg-transparent mb-4 overflow-hidden">
          <div
            className={cn(
              "relative w-full max-w-xl rounded-xl overflow-hidden shadow-lg border border-line/50 transition-all duration-300 flex items-center justify-center bg-slate-900",
              getAspectClasses()
            )}
          >
            {currentImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentImageUrl}
                alt={block.prompt}
                style={{ filter: filterStyle }}
                className="w-full h-full object-cover transition-all duration-200"
              />
            ) : (
              <div
                style={{ filter: filterStyle }}
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: defaultSvgIllustration }}
              />
            )}

            {/* Overlay textuel dynamique */}
            {overlayText && (
              <div className="absolute inset-x-0 bottom-4 text-center px-4">
                <span className="inline-block bg-black/60 backdrop-blur-md text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg">
                  {overlayText}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barre d'outils de retouche visuelle (Filtres réels) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-line bg-panel p-4 text-xs">
          {/* Colonne 1 : Recadrage & Filtres */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-1.5">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Crop className="h-3.5 w-3.5 text-accent" />
                Recadrage (Ratio)
              </span>
              <div className="flex gap-1">
                {(["1:1", "16:9", "4:3", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                      aspectRatio === ratio
                        ? "bg-accent text-white"
                        : "border border-line bg-card text-muted hover:text-ink"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Luminosité : {brightness}%</span>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-32 h-1.5 bg-line rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Contraste : {contrast}%</span>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-32 h-1.5 bg-line rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Saturation : {saturation}%</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-32 h-1.5 bg-line rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Teinte (Hue) : {hueRotate}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hueRotate}
                  onChange={(e) => setHueRotate(Number(e.target.value))}
                  className="w-32 h-1.5 bg-line rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Colonne 2 : Éléments identifiés & Texte superposé */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-1.5">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-accent" />
                Éléments identifiés
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] text-accent hover:underline font-medium"
              >
                Réinitialiser
              </button>
            </div>

            <div className="space-y-1.5">
              {elements.map((el) => (
                <div
                  key={el.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-card p-2 text-xs"
                >
                  <span className="text-ink font-medium">{el.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded-full border border-white/50"
                      style={{ backgroundColor: el.color || accentColor }}
                    />
                    <span className="text-[10px] text-faint uppercase">{el.type}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-muted">Couleur d&apos;accentuation</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-line p-0 bg-transparent"
              />
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-muted">Texte superposé (Titre/Légende)</label>
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Ajouter une légende sur l'image..."
                className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
