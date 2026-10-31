/**
 * Moteur d'export réel pour le Canva Studio Intelligent UI.
 * Prend en charge les formats : SVG, PNG, JPG, WebP, PDF, HTML, JSON et Fichiers sources.
 * Aucune simulation : les rendus sont rasterisés via l'API Canvas HTML5 ou sérialisés depuis le DOM.
 */

export type ImageFormat = "png" | "jpg" | "webp";

function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string, ext: string): string {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  return `${clean || "creation-canva"}.${ext}`;
}

/**
 * Normalise un code SVG pour s'assurer que les espaces de noms XML requis sont présents.
 */
export function ensureSvgXmlns(svgCode: string): string {
  let result = svgCode.trim();
  if (!result.includes('xmlns="http://www.w3.org/2000/svg"')) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg$1 xmlns="http://www.w3.org/2000/svg">');
  }
  if (!result.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">');
  }
  return result;
}

/**
 * Exporte directement le contenu d'un élément HTML5 Canvas au format PNG, JPG ou WebP
 */
export function exportCanvasToRaster(
  canvas: HTMLCanvasElement,
  name = "creation-canva",
  format: ImageFormat = "png"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const mimeType =
      format === "jpg"
        ? "image/jpeg"
        : format === "webp"
          ? "image/webp"
          : "image/png";

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Échec de la conversion du Canvas en Blob"));
          return;
        }
        downloadBlob(blob, sanitizeFilename(name, format));
        resolve();
      },
      mimeType,
      0.95
    );
  });
}

/**
 * Exporte une chaîne de code SVG valide au format fichier .svg
 */
export function exportSvgString(svgCode: string, name = "creation-vectorielle") {
  const normalized = ensureSvgXmlns(svgCode);
  const blob = new Blob([normalized], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, sanitizeFilename(name, "svg"));
}

/**
 * Exporte un élément SVG du DOM en fichier SVG
 */
export function exportSvgElement(element: SVGSVGElement, name = "creation-vectorielle") {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(element);
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  const fullSvg = `<?xml version="1.0" standalone="no"?>\r\n${source}`;
  exportSvgString(fullSvg, name);
}

/**
 * Rasterise un élément SVG ou HTML vers Canvas puis exporte en PNG, JPG ou WebP
 */
export async function exportSvgToRaster(
  svgString: string,
  name: string,
  format: ImageFormat = "png",
  scale = 2,
  backgroundColor = "#ffffff"
): Promise<void> {
  if (typeof window === "undefined") return;

  return new Promise((resolve, reject) => {
    const normalizedSvg = ensureSvgXmlns(svgString);
    const parser = new DOMParser();
    const doc = parser.parseFromString(normalizedSvg, "image/svg+xml");
    const svgEl = doc.querySelector("svg");

    let width = 800;
    let height = 600;

    if (svgEl) {
      const viewBox = svgEl.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          width = parts[2];
          height = parts[3];
        }
      } else {
        const w = parseFloat(svgEl.getAttribute("width") || "");
        const h = parseFloat(svgEl.getAttribute("height") || "");
        if (!isNaN(w) && w > 0) width = w;
        if (!isNaN(h) && h > 0) height = h;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Impossible de créer le contexte 2D Canvas"));
      return;
    }

    if (format === "jpg" || backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const blob = new Blob([normalizedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const mimeType =
        format === "jpg"
          ? "image/jpeg"
          : format === "webp"
            ? "image/webp"
            : "image/png";

      canvas.toBlob(
        (outputBlob) => {
          if (!outputBlob) {
            reject(new Error("Échec de la conversion Canvas en Blob"));
            return;
          }
          downloadBlob(outputBlob, sanitizeFilename(name, format));
          resolve();
        },
        mimeType,
        0.95
      );
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Erreur de chargement SVG dans l'image Canvas: " + String(e)));
    };

    img.src = url;
  });
}

/**
 * Exporte un objet ou schéma structuré sous forme de fichier JSON
 */
export function exportJson(data: unknown, name = "creation-canva") {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, sanitizeFilename(name, "json"));
}

/**
 * Exporte une page HTML autonome et interactive
 */
export function exportInteractiveHtml(
  title: string,
  htmlBody: string,
  name = "mini-application"
) {
  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} - France Student Canva</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen p-4 sm:p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    <header class="p-6 border-b border-slate-200 bg-slate-100 flex items-center justify-between no-print">
      <div>
        <h1 class="text-xl font-bold text-slate-800">${escapeHtml(title)}</h1>
        <p class="text-xs text-slate-500">France Student Canva · Document interactif autonome</p>
      </div>
      <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
        Imprimer / PDF
      </button>
    </header>
    <main class="p-6 sm:p-8">
      ${htmlBody}
    </main>
    <footer class="p-4 border-t border-slate-200 text-center text-xs text-slate-400 no-print">
      Créé avec France Student Intelligent UI Canva · Tout droit réservé
    </footer>
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, sanitizeFilename(name, "html"));
}

/**
 * Déclenche l'impression ou sauvegarde en PDF via la boîte de dialogue système
 */
export function exportToPdfPrint() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
