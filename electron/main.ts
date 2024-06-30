import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  shell,
  Tray,
} from "electron";
import path from "node:path";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

const isMacOS = process.platform === "darwin";

let settingsWindow: BrowserWindow | null;
let monitoredAppsWindow: BrowserWindow | null;
let tray: Tray | null = null;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

import Store from "electron-store";

const store = new Store();

const windowIcon = nativeImage.createFromPath(
  path.join(process.env.VITE_PUBLIC, "app-icon.png")
);

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    title: "Settings",
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    // skipTaskbar: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    width: 512,
    height: 620,
  });

  // Test active push message to Renderer-process.
  settingsWindow.webContents.on("did-finish-load", () => {
    // win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(VITE_DEV_SERVER_URL + "settings");
  } else {
    // win.loadFile('dist/index.html')
    settingsWindow.loadFile(path.join(process.env.DIST, "index.html"));
  }

  settingsWindow.webContents.openDevTools();

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createMonitoredAppsWindow() {
  monitoredAppsWindow = new BrowserWindow({
    title: "Monitored Apps",
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    // skipTaskbar: true,
    minimizable: false,
    fullscreenable: false,
    width: 512,
    height: 620,
    minWidth: 320,
    minHeight: 320,
  });

  // Test active push message to Renderer-process.
  monitoredAppsWindow.webContents.on("did-finish-load", () => {
    // win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    monitoredAppsWindow.loadURL(VITE_DEV_SERVER_URL + "monitored-apps");
  } else {
    // win.loadFile('dist/index.html')
    monitoredAppsWindow.loadFile(path.join(process.env.DIST, "index.html"));
  }

  monitoredAppsWindow.webContents.openDevTools();

  monitoredAppsWindow.on("closed", () => {
    monitoredAppsWindow = null;
  });
}

app.on("window-all-closed", () => {});

app.on("activate", () => {});

const trayIcon = nativeImage.createFromPath(
  path.join(process.env.VITE_PUBLIC, "tray-icon.png")
);

ipcMain.on("electron-store-get", async (event, val) => {
  event.returnValue = store.get(val);
});

ipcMain.on("electron-store-set", async (_, key, val) => {
  store.set(key, val);
});

function createTray() {
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Dashboard",
      type: "normal",
      click: () => {
        shell.openExternal("https://wakatime.com/dashboard");
      },
    },
    {
      label: "Settings",
      type: "normal",
      click: () => {
        if (settingsWindow) {
          settingsWindow.focus();
        } else {
          createSettingsWindow();
        }
      },
    },
    {
      label: "Monitored Apps",
      type: "normal",
      click: () => {
        if (monitoredAppsWindow) {
          monitoredAppsWindow.focus();
        } else {
          createMonitoredAppsWindow();
        }
      },
    },
    { type: "separator" },
    {
      label: "Check for Updates",
      type: "normal",
      click: () => {
        const notification = new Notification({
          title: "Not implemented yet!",
        });
        notification.show();
      },
    },
    { type: "separator" },
    {
      label: isMacOS ? "Quit" : "Exit",
      type: "normal",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Wakatime");
  tray.setContextMenu(contextMenu);
  tray.addListener("click", () => {
    tray?.popUpContextMenu();
  });
}

app.whenReady().then(createTray);
