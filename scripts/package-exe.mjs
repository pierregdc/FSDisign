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

// 1. S'assurer que les fichiers statiques et publics sont dans .next/standalone
console.log("-> Copie des assets statiques dans le dossier standalone...");
const publicSrc = path.join(projectRoot, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
}

const staticSrc = path.join(projectRoot, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
}

// 2. Nettoyer ou créer le répertoire de distribution
console.log("-> Création du répertoire de sortie:", outputDir);
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 3. Copier l'environnement Electron précompilé
console.log("-> Copie de l'exécutable Electron et des bibliothèques runtime...");
fs.cpSync(electronDist, outputDir, { recursive: true });

// 4. Renommer electron.exe en FSDisign.exe
const originalExe = path.join(outputDir, "electron.exe");
const targetExe = path.join(outputDir, "FSDisign.exe");
if (fs.existsSync(originalExe)) {
  fs.renameSync(originalExe, targetExe);
  console.log("-> Exécutable renommé en: FSDisign.exe");
}

// 5. Nettoyer l'application par défaut
const defaultAsar = path.join(outputDir, "resources", "default_app.asar");
if (fs.existsSync(defaultAsar)) {
  fs.unlinkSync(defaultAsar);
}

// 6. Construire resources/app
console.log("-> Assemblage des ressources applicatives (resources/app)...");
const appDir = path.join(outputDir, "resources", "app");
fs.mkdirSync(appDir, { recursive: true });

// Package.json pour l'application Electron
const appPackageJson = {
  name: "fsdisign",
  version: "1.0.0",
  main: "electron/main.cjs",
  description: "FranceStudent Canva - Studio UI Design Desktop",
};
fs.writeFileSync(
  path.join(appDir, "package.json"),
  JSON.stringify(appPackageJson, null, 2),
  "utf-8"
);

// Copier le dossier electron
fs.cpSync(path.join(projectRoot, "electron"), path.join(appDir, "electron"), {
  recursive: true,
});

// Copier le serveur autonome dans app/standalone
console.log("-> Intégration du serveur de production Next.js autonome...");
fs.cpSync(standaloneDir, path.join(appDir, "standalone"), { recursive: true });

console.log("\n=======================================================");
console.log("SUCCÈS: Application autonome générée avec succès !");
console.log(`Exécutable principal: ${targetExe}`);
console.log("=======================================================\n");
