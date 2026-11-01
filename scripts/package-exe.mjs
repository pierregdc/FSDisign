import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("==> Préparation du package exécutable FSDisign (.exe)...");

const electronDist = path.join(projectRoot, "node_modules", "electron", "dist");
const outputDir = path.join(projectRoot, "dist", "FSDisign-win32-x64");
const standaloneDir = path.join(projectRoot, ".next", "standalone");

if (!fs.existsSync(electronDist)) {
  console.error("ERREUR: Electron dist introuvable dans node_modules/electron/dist");
  process.exit(1);
}

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("ERREUR: Le serveur Next.js standalone n'a pas été compilé. Exécutez 'npm run build' d'abord.");
  process.exit(1);
}

function robustCopy(src, dest) {
  if (process.platform === "win32") {
    fs.mkdirSync(dest, { recursive: true });
    spawnSync("robocopy", [src, dest, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/R:1", "/W:1"], { stdio: "ignore" });
  } else {
    fs.cpSync(src, dest, { recursive: true, force: true });
  }
}

// 1. S'assurer que les fichiers statiques et publics sont dans .next/standalone
console.log("-> Copie des assets statiques dans le dossier standalone...");
const publicSrc = path.join(projectRoot, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  robustCopy(publicSrc, publicDest);
}

const staticSrc = path.join(projectRoot, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
if (fs.existsSync(staticSrc)) {
  robustCopy(staticSrc, staticDest);
}

// 2. Nettoyer ou créer le répertoire de distribution
console.log("-> Création du répertoire de sortie:", outputDir);
if (fs.existsSync(outputDir)) {
  try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch {}
}
fs.mkdirSync(outputDir, { recursive: true });

// 3. Copier l'environnement Electron précompilé
console.log("-> Copie de l'exécutable Electron et des bibliothèques runtime...");
robustCopy(electronDist, outputDir);

// 4. Renommer electron.exe en FSDisign.exe
const originalExe = path.join(outputDir, "electron.exe");
const targetExe = path.join(outputDir, "FSDisign.exe");
if (fs.existsSync(originalExe)) {
  fs.renameSync(originalExe, targetExe);
  console.log("-> Exécutable renommé en: FSDisign.exe");
}

// 4b. Personnaliser l'icône Win32 et les métadonnées de FSDisign.exe pour supprimer le logo Electron
const rceditExe = path.join(projectRoot, "scripts", "rcedit-x64.exe");
const iconIco = path.join(projectRoot, "electron", "app-icon.ico");
if (fs.existsSync(rceditExe) && fs.existsSync(iconIco) && fs.existsSync(targetExe)) {
  console.log("-> Intégration de l'icône officielle FranceStudent dans FSDisign.exe via rcedit...");
  const rceditResult = spawnSync(rceditExe, [
    targetExe,
    "--set-icon", iconIco,
    "--set-version-string", "FileDescription", "FranceStudent CANVA - Studio UI Design",
    "--set-version-string", "ProductName", "FSDisign",
    "--set-version-string", "CompanyName", "FranceStudent",
    "--set-version-string", "LegalCopyright", "Copyright (c) FranceStudent",
    "--set-file-version", "1.1.0",
    "--set-product-version", "1.1.0",
  ], { stdio: "inherit" });
  if (rceditResult.status === 0) {
    console.log("-> [SUCCÈS] Icône FranceStudent gravée dans l'exécutable FSDisign.exe (logo Electron éliminé) !");
  }
}

// 5. Nettoyer l'application par défaut et les fichiers superflus
const defaultAsar = path.join(outputDir, "resources", "default_app.asar");
if (fs.existsSync(defaultAsar)) {
  fs.unlinkSync(defaultAsar);
}

// Optimisation de taille : conserver uniquement les locales nécessaires (fr, en-US)
const localesDir = path.join(outputDir, "locales");
if (fs.existsSync(localesDir)) {
  const allowed = new Set(["fr.pak", "en-US.pak"]);
  const files = fs.readdirSync(localesDir);
  for (const f of files) {
    if (!allowed.has(f)) {
      try {
        fs.unlinkSync(path.join(localesDir, f));
      } catch {}
    }
  }
  console.log("-> Locales optimisées (conservé fr.pak et en-US.pak)");
}

// 6. Construire resources/app
console.log("-> Assemblage des ressources applicatives (resources/app)...");
const appDir = path.join(outputDir, "resources", "app");
fs.mkdirSync(appDir, { recursive: true });

const appPackageJson = {
  name: "fsdisign",
  version: "1.1.0",
  main: "electron/main.cjs",
  description: "FranceStudent CANVA - Studio UI Design Desktop",
};
fs.writeFileSync(
  path.join(appDir, "package.json"),
  JSON.stringify(appPackageJson, null, 2),
  "utf-8"
);

// Copier le dossier electron
robustCopy(path.join(projectRoot, "electron"), path.join(appDir, "electron"));
for (const cleanupFile of ["installer.iss", "wizard-large.bmp", "wizard-small.bmp"]) {
  const p = path.join(appDir, "electron", cleanupFile);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

// Copier le serveur autonome dans app/standalone
console.log("-> Intégration du serveur de production Next.js autonome...");
robustCopy(standaloneDir, path.join(appDir, "standalone"));

console.log("\n=======================================================");
console.log("SUCCÈS: Application autonome générée avec succès !");
console.log(`Exécutable principal: ${targetExe}`);
console.log("=======================================================\n");
