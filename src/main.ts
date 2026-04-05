import path from "node:path";
import { app, BrowserWindow } from "electron";
import { ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { UpdateSourceType, updateElectronApp } from "update-electron-app";
import { ipcContext } from "@/ipc/context";
import { IPC_CHANNELS, inDevelopment } from "./constants";
import { getBasePath } from "./utils/path";
import { initializeAppDirectories } from "./utils/app-data";
import {
  getToolsInfo,
  downloadAndExtractJadx,
  downloadAndExtractJre,
} from "./utils/tools-manager";

function createWindow() {
  const basePath = getBasePath();
  const preload = path.join(basePath, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,

      preload,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });
  ipcContext.setMainWindow(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(basePath, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

function checkForUpdates() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "LuanRoger/electron-shadcn",
    },
  });
}

async function setupORPC() {
  const { rpcHandler } = await import("./ipc/handler");

  ipcMain.on(IPC_CHANNELS.START_ORPC_SERVER, (event) => {
    const [serverPort] = event.ports;

    serverPort.start();
    rpcHandler.upgrade(serverPort);
  });
}

/**
 * Silently ensures JADX and JRE are downloaded in the background.
 * Only downloads tools that are not already installed (status !== 1).
 * Does NOT block the UI — runs fully in the background.
 */
function bootstrapTools(): void {
  const info = getToolsInfo();

  if (info.jadx_status !== 1) {
    console.log("[bootstrapTools] JADX not found — starting silent download...");
    downloadAndExtractJadx()
      .then((result) => {
        if (result.success) {
          console.log("[bootstrapTools] JADX downloaded and ready.");
        } else {
          console.error("[bootstrapTools] JADX download failed:", result.error);
        }
      })
      .catch((err) => {
        console.error("[bootstrapTools] JADX download error:", err);
      });
  } else {
    console.log("[bootstrapTools] JADX already installed, skipping.");
  }

  if (info.jre_status !== 1) {
    console.log("[bootstrapTools] JRE not found — starting silent download...");
    downloadAndExtractJre()
      .then((result) => {
        if (result.success) {
          console.log("[bootstrapTools] JRE downloaded and ready.");
        } else {
          console.error("[bootstrapTools] JRE download failed:", result.error);
        }
      })
      .catch((err) => {
        console.error("[bootstrapTools] JRE download error:", err);
      });
  } else {
    console.log("[bootstrapTools] JRE already installed, skipping.");
  }
}

app.whenReady().then(async () => {
  try {
    // Initialize app directories first
    initializeAppDirectories();

    createWindow();
    await installExtensions();
    checkForUpdates();
    await setupORPC();

    // Silently download JADX + JRE in the background if not already present
    bootstrapTools();
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
