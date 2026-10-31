import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("==> Étape 1 : Compilation Next.js & package FSDisign.exe...");
const packageResult = spawnSync("node", [path.join(projectRoot, "scripts", "package-exe.mjs")], {
  stdio: "inherit",
  cwd: projectRoot,
});

if (packageResult.status !== 0) {
  console.error("Échec de la préparation du package exécutable.");
  process.exit(1);
}

console.log("\n==> Étape 2 : Compilation de l'installateur Windows Inno Setup...");
const candidateIsccPaths = [
  "C:\\Users\\peter\\AppData\\Local\\Programs\\Inno Setup 6\\ISCC.exe",
  "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
  "C:\\Program Files\\Inno Setup 6\\ISCC.exe",
];

let isccExe = candidateIsccPaths.find((p) => fs.existsSync(p)) || "iscc";

const issFile = path.join(projectRoot, "electron", "installer.iss");
const isccResult = spawnSync(isccExe, [issFile], {
  stdio: "inherit",
  cwd: projectRoot,
});

if (isccResult.status !== 0) {
  console.error("Échec de la compilation Inno Setup.");
  process.exit(1);
}

const installerSrc = path.join(projectRoot, "dist", "installer", "FSDisign-Setup.exe");
const rootDest = path.resolve(projectRoot, "..", "FSDisign-Setup.exe");
if (fs.existsSync(installerSrc)) {
  fs.copyFileSync(installerSrc, rootDest);
  console.log(`\n[OK] Installateur copié dans le dossier racine : ${rootDest}`);
}

console.log("\n=======================================================");
console.log("SUCCÈS : Installateur graphique généré avec succès !");
console.log(`Fichier d'installation : ${rootDest}`);
console.log("=======================================================\n");
