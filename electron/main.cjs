const { app, BrowserWindow, Menu, shell, ipcMain, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");

const TARGET_PORT = process.env.PORT || 3000;
const TARGET_URL = `http://localhost:${TARGET_PORT}`;
let mainWindow = null;
let nextProcess = null;

// Empêcher les doublons d'instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Gestion de la sauvegarde de la taille et position de la fenêtre
function getWindowStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function loadWindowState() {
  try {
    const raw = fs.readFileSync(getWindowStatePath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { width: 1360, height: 860, isMaximized: false };
  }
}

function saveWindowState() {
  if (!mainWindow) return;
  try {
    const isMaximized = mainWindow.isMaximized();
    const bounds = mainWindow.getBounds();
    fs.writeFileSync(
      getWindowStatePath(),
      JSON.stringify({ ...bounds, isMaximized })
    );
  } catch {
    // Ignore error
  }
}

// Vérifier si le serveur Next.js répond
function isServerReady(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Démarrer le serveur Next.js si besoin
async function ensureServerRunning() {
  const ready = await isServerReady(TARGET_URL);
  if (ready) {
    console.log(`[Electron] Serveur détecté sur ${TARGET_URL}`);
    return;
  }

  // Vérifier d'abord si un serveur standalone compilé est présent
  const candidateStandalonePaths = [
    path.join(__dirname, "..", "standalone", "server.js"),
    path.join(__dirname, "..", ".next", "standalone", "server.js"),
    path.join(app.getAppPath(), "standalone", "server.js"),
    path.join(app.getAppPath(), ".next", "standalone", "server.js"),
  ];

  let standalonePath = null;
  for (const p of candidateStandalonePaths) {
    if (fs.existsSync(p)) {
      standalonePath = p;
      break;
    }
  }

  if (standalonePath) {
    console.log(`[Electron] Lancement du serveur Next.js autonome embarqué (${standalonePath})...`);
    const serverDir = path.dirname(standalonePath);

    nextProcess = spawn(process.execPath, [standalonePath], {
      cwd: serverDir,
      stdio: "pipe",
      windowsHide: true,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: TARGET_PORT.toString(),
        HOSTNAME: "127.0.0.1",
      },
    });
  } else {
    console.log(`[Electron] Lancement du serveur Next.js en arrière-plan via npm...`);
    const projectRoot = path.join(__dirname, "..");
    const isDev = process.env.NODE_ENV !== "production";
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const scriptName = isDev ? "dev" : "start";

    nextProcess = spawn(npmCmd, ["run", scriptName], {
      cwd: projectRoot,
      stdio: "inherit",
      env: { ...process.env, PORT: TARGET_PORT.toString() },
    });
  }

  // Attendre que le serveur soit prêt (max 45 secondes)
  const startTime = Date.now();
  while (Date.now() - startTime < 45000) {
    await new Promise((r) => setTimeout(r, 600));
    const nowReady = await isServerReady(TARGET_URL);
    if (nowReady) {
      console.log(`[Electron] Serveur Next.js prêt sur ${TARGET_URL}`);
      return;
    }
  }

  console.warn(`[Electron] Délai dépassé pour la réponse du serveur Next.js.`);
}

function buildApplicationMenu() {
  const template = [
    {
      label: "Fichier",
      submenu: [
        {
          label: "Nouvelle discussion",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(TARGET_URL);
            }
          },
        },
        { type: "separator" },
        {
          label: "Quitter FranceStudent CANVA",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Alt+F4",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Édition",
      submenu: [
        { label: "Annuler", role: "undo" },
        { label: "Rétablir", role: "redo" },
        { type: "separator" },
        { label: "Couper", role: "cut" },
        { label: "Copier", role: "copy" },
        { label: "Coller", role: "paste" },
        { label: "Tout sélectionner", role: "selectAll" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { label: "Actualiser", role: "reload", accelerator: "F5" },
        { label: "Actualiser sans cache", role: "forceReload", accelerator: "CmdOrCtrl+F5" },
        { type: "separator" },
        { label: "Zoom avant", role: "zoomIn" },
        { label: "Zoom arrière", role: "zoomOut" },
        { label: "Taille normale", role: "resetZoom" },
        { type: "separator" },
        { label: "Plein écran", role: "togglefullscreen" },
        {
          label: "Outils de développement (DevTools)",
          accelerator: "F12",
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "Portail France Student (francestudent.org)",
          click: () => shell.openExternal("https://francestudent.org/"),
        },
        {
          label: "Plateforme IA (ia.francestudent.org)",
          click: () => shell.openExternal("https://ia.francestudent.org/"),
        },
        {
          label: "API & Documentation technique",
          click: () => shell.openExternal("https://api.francestudent.ai/swagger-ui/index.html"),
        },
        { type: "separator" },
        {
          label: "À propos de FranceStudent CANVA UI",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(
                `alert("FranceStudent — Studio UI Design\\nVersion 1.0.0 (Desktop Electron)\\nArchitecture : Next.js 16 + Electron 41");`
              );
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function createWindow() {
  const windowState = loadWindowState();

  const candidateIcons = [
    path.join(__dirname, "app-icon.ico"),
    path.join(__dirname, "..", "standalone", "public", "france-student-mark.png"),
    path.join(__dirname, "..", "public", "france-student-mark.png"),
    path.join(__dirname, "france-student-mark.png"),
  ];
  const iconPath = candidateIcons.find((item) => fs.existsSync(item));

  mainWindow = new BrowserWindow({
    width: windowState.width || 1360,
    height: windowState.height || 860,
    x: windowState.x,
    y: windowState.y,
    minWidth: 960,
    minHeight: 640,
    title: "FranceStudent — Studio UI Design",
    backgroundColor: "#0B0F19",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  buildApplicationMenu();

  // Intercepter les liens externes pour les ouvrir dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(TARGET_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Sauvegarder l'état à la fermeture
  mainWindow.on("close", () => {
    saveWindowState();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Page temporaire d'attente stylisée pendant le boot
  const loadingHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>FranceStudent CANVA — Chargement</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          background: #0B0F19;
          color: #F8FAFC;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .logo { width: 72px; height: 72px; margin-bottom: 24px; animation: pulse 2s infinite ease-in-out; }
        .title { font-size: 18px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .subtitle { font-size: 13px; color: #94A3B8; margin-bottom: 24px; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #0284c7; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.85; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } }
      </style>
    </head>
    <body>
      <div class="title">FranceStudent</div>
      <div class="subtitle">Initialisation du Studio UI Design...</div>
      <div class="spinner"></div>
    </body>
    </html>
  `;

  await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);
  mainWindow.show();

  // S'assurer que le serveur Next.js tourne
  await ensureServerRunning();

  // Charger la vraie interface Next.js
  await mainWindow.loadURL(TARGET_URL);

  // Vérification silencieuse des mises à jour 5 secondes après le chargement
  setTimeout(() => {
    try {
      const updateUrl = `${TARGET_URL}/api/updates`;
      http.get(updateUrl, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (data.hasUpdate && mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("update-available", data);
            }
          } catch {}
        });
      }).on("error", () => {});
    } catch {}
  }, 5000);
}

// Enregistrement des IPC handlers pour preload
ipcMain.handle("open-external", (_, url) => {
  if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
    return shell.openExternal(url);
  }
});

// IPC pour la vérification des mises à jour
ipcMain.handle("check-for-updates", async () => {
  try {
    const updateUrl = `${TARGET_URL}/api/updates?force=1`;
    return new Promise((resolve) => {
      http.get(updateUrl, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ hasUpdate: false, status: "error" });
          }
        });
      }).on("error", () => resolve({ hasUpdate: false, status: "error" }));
    });
  } catch {
    return { hasUpdate: false, status: "error" };
  }
});

// IPC pour l'installation d'une mise à jour téléchargée
ipcMain.handle("install-update", async (_, downloadUrl) => {
  if (!downloadUrl) return { success: false, error: "URL de téléchargement manquante" };

  if (typeof downloadUrl === "string" && !downloadUrl.toLowerCase().endsWith(".exe")) {
    shell.openExternal(downloadUrl);
    return { success: true, openedBrowser: true };
  }

  try {
    const tempDir = app.getPath("temp");
    const installerPath = path.join(tempDir, "FSDisign-Update-Setup.exe");
    const https = require("https");

    console.log(`[AutoUpdate] Téléchargement de la mise à jour depuis ${downloadUrl}...`);

    const file = fs.createWriteStream(installerPath);
    await new Promise((resolve, reject) => {
      const getFile = (url) => {
        https.get(url, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            getFile(response.headers.location);
          } else {
            response.pipe(file);
            file.on("finish", () => file.close(resolve));
          }
        }).on("error", reject);
      };
      getFile(downloadUrl);
    });

    console.log(`[AutoUpdate] Téléchargement terminé : ${installerPath}. Lancement de l'installateur...`);
    shell.openPath(installerPath);
    setTimeout(() => app.quit(), 1500);
    return { success: true, launchedInstaller: true };
  } catch (err) {
    console.error("[AutoUpdate] Erreur lors du téléchargement :", err);
    shell.openExternal(downloadUrl);
    return { success: false, fallbackToBrowser: true };
  }
});

ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on("window-close", () => mainWindow?.close());

app.setAppUserModelId("org.francestudent.fsdisign");
app.whenReady().then(createWindow);

function terminateServerProcess() {
  if (nextProcess && nextProcess.pid) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", nextProcess.pid.toString(), "/f", "/t"]);
      } else {
        nextProcess.kill("SIGINT");
      }
    } catch {
      // Ignorer
    }
  }
}

app.on("window-all-closed", () => {
  terminateServerProcess();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  terminateServerProcess();
});
