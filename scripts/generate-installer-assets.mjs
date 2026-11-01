import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function createBmpBuffer(width, height, rgbBuffer) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = Buffer.alloc(fileSize);

  // Bitmap File Header (14 bytes)
  buf.write("BM", 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6); // Reserved
  buf.writeUInt32LE(54, 10); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22); // Positive height = bottom-up
  buf.writeUInt16LE(1, 26); // Color planes
  buf.writeUInt16LE(24, 28); // Bits per pixel (24-bit RGB)
  buf.writeUInt32LE(0, 30); // BI_RGB (uncompressed)
  buf.writeUInt32LE(pixelArraySize, 34);
  buf.writeInt32LE(2835, 38); // 72 DPI (2835 pixels/meter)
  buf.writeInt32LE(2835, 42); // 72 DPI
  buf.writeUInt32LE(0, 46); // Total colors
  buf.writeUInt32LE(0, 50); // Important colors

  // Pixels in BMP are BGR and bottom-to-top
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    const srcRowOffset = srcY * width * 3;
    const destRowOffset = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const r = rgbBuffer[srcRowOffset + x * 3];
      const g = rgbBuffer[srcRowOffset + x * 3 + 1];
      const b = rgbBuffer[srcRowOffset + x * 3 + 2];
      buf[destRowOffset + x * 3] = b;
      buf[destRowOffset + x * 3 + 1] = g;
      buf[destRowOffset + x * 3 + 2] = r;
    }
  }

  return buf;
}

/**
 * Création d'un fichier .ico Windows valide contenant plusieurs résolutions en PNG
 */
function createIcoFile(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = Icon
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = item.width >= 256 ? 0 : item.width;
    const h = item.height >= 256 ? 0 : item.height;

    entry.writeUInt8(w, 0); // Width
    entry.writeUInt8(h, 1); // Height
    entry.writeUInt8(0, 2); // Colors (0 = No palette)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset to image data

    offset += item.buffer.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

async function generateInstallerAssets() {
  console.log("==> Génération des visuels haute fidélité pour l'installeur...");
  const electronDir = path.join(projectRoot, "electron");
  const publicDir = path.join(projectRoot, "public");
  const markPngPath = path.join(publicDir, "france-student-mark.png");

  if (!fs.existsSync(electronDir)) {
    fs.mkdirSync(electronDir, { recursive: true });
  }

  // 1. Wizard Large BMP (164 x 314 px)
  // Bannière verticale moderne avec dégradé sombre, logo et typographie épurée
  const logoBuffer = await sharp(markPngPath)
    .resize(68, 68, { fit: "contain" })
    .png()
    .toBuffer();

  const svgBannerOverlay = `
    <svg width="164" height="314" viewBox="0 0 164 314" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Fond Dégradé Sombre -->
      <rect width="164" height="314" fill="url(#bgGrad)"/>
      <circle cx="82" cy="90" r="70" fill="url(#glow)"/>

      <!-- Séparateur lumineux subtil -->
      <line x1="20" y1="200" x2="144" y2="200" stroke="#334155" stroke-width="0.8" opacity="0.6"/>

      <!-- Titres & Typographie -->
      <text x="82" y="165" font-family="Segoe UI, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">FSDisign</text>
      <text x="82" y="185" font-family="Segoe UI, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" text-anchor="middle">Studio UI Design</text>

      <text x="82" y="222" font-family="Segoe UI, sans-serif" font-size="9" font-weight="500" fill="#38bdf8" text-anchor="middle">France Student</text>
      <text x="82" y="238" font-family="Segoe UI, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Canva · Math · Travel</text>

      <!-- Badge de version -->
      <rect x="52" y="280" width="60" height="18" rx="9" fill="rgba(99, 102, 241, 0.2)"/>
      <text x="82" y="292" font-family="monospace" font-size="8" font-weight="bold" fill="#a5b4fc" text-anchor="middle">v1.0.0</text>
    </svg>
  `;

  const bannerComposite = await sharp(Buffer.from(svgBannerOverlay))
    .composite([
      {
        input: logoBuffer,
        top: 55,
        left: 48,
      },
    ])
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const wizardLargeBmp = createBmpBuffer(164, 314, bannerComposite.data);
  fs.writeFileSync(path.join(electronDir, "wizard-large.bmp"), wizardLargeBmp);
  console.log("[OK] wizard-large.bmp généré avec succès (164x314 px).");

  // 2. Wizard Small BMP (55 x 55 px)
  const smallLogoBuffer = await sharp(markPngPath)
    .resize(36, 36, { fit: "contain" })
    .png()
    .toBuffer();

  const svgSmallOverlay = `
    <svg width="55" height="55" viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="55" height="55" fill="url(#bgSmall)"/>
    </svg>
  `;

  const smallComposite = await sharp(Buffer.from(svgSmallOverlay))
    .composite([
      {
        input: smallLogoBuffer,
        top: 9,
        left: 9,
      },
    ])
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const wizardSmallBmp = createBmpBuffer(55, 55, smallComposite.data);
  fs.writeFileSync(path.join(electronDir, "wizard-small.bmp"), wizardSmallBmp);
  console.log("[OK] wizard-small.bmp généré avec succès (55x55 px).");

  // 3. App Icon ICO multi-résolutions (16, 32, 48, 64, 128, 256)
  const sizes = [16, 32, 48, 64, 128, 256];
  const icoPngEntries = [];

  for (const s of sizes) {
    const pngBuf = await sharp(markPngPath)
      .resize(s, s, { fit: "contain" })
      .png()
      .toBuffer();
    icoPngEntries.push({ width: s, height: s, buffer: pngBuf });
  }

  const icoBuffer = createIcoFile(icoPngEntries);
  fs.writeFileSync(path.join(electronDir, "app-icon.ico"), icoBuffer);
  console.log("[OK] app-icon.ico généré avec succès (multi-résolutions).");
}

generateInstallerAssets().catch((err) => {
  console.error("Erreur lors de la génération des assets :", err);
  process.exit(1);
});
