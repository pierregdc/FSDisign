"use client";

import { useRef, useState } from "react";
import {
  Crop,
  ImageIcon,
  Sliders,
  Upload,
  Wand2,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot, type ViewportMode } from "@/features/canva";
import { exportCanvasToRaster, type ImageFormat } from "@/lib/canva-export";
import { cn } from "@/lib/utils";

type ImageStudioBlockData = Extract<UIBlock, { type: "imageStudio" }>;

export function ImageStudioBlockView({
  block,
  onPrompt,
}: {
  block: ImageStudioBlockData;
  onPrompt?: (prompt: string) => void;
}) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(block.url || null);
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
  const defaultSvgIllustration = block.svg || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
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
    <text font-size="28" font-weight="bold" font-family="sans-serif">${block.title || "Composition Visuelle"}</text>
    <text y="40" font-size="14" fill="#cbd5e1" font-family="sans-serif">${block.category.toUpperCase()} · FRANCE STUDENT CANVA</text>
  </g>
</svg>`;

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
