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
import { getAppSettings, setAppSettings } from "./settings";
import { getAvailableApps } from "./helpers";
import {
  subscribeActiveWindow,
  unsubscribeAllActiveWindow,
  WindowInfo,
} from "@miniben90/x-win";
import {
  GET_APP_SETTINGS_IPC_KEY,
  GET_APP_VERSION_IPC_KEY,
  GET_INSTALLED_APPS_IPC_KEY,
  SET_APP_SETTINGS_IPC_KEY,
} from "./keys";
import {
  GlobalKeyboardListener,
  IGlobalKeyDownMap,
  IGlobalKeyEvent,
} from "node-global-key-listener";
const gkl = new GlobalKeyboardListener();

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
process.env.ELECTRON_DIR = app.isPackaged
  ? __dirname
  : path.join(__dirname, "../electron");

const isMacOS = process.platform === "darwin";

let settingsWindow: BrowserWindow | null = null;
let monitoredAppsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const windowIcon = nativeImage.createFromPath(
  path.join(process.env.VITE_PUBLIC, "app-icon.png"),
);

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    title: "Settings",
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    skipTaskbar: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    width: 512,
    height: 320,
    show: false,
    autoHideMenuBar: true,
  });

  // Test active push message to Renderer-process.
  // settingsWindow.webContents.on("did-finish-load", () => {
  //   const appSettings = getAppSettings();
  //   settingsWindow?.webContents.send("app-settings", appSettings);
  // });

  if (VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(VITE_DEV_SERVER_URL + "settings");
  } else {
    // win.loadFile('dist/index.html')
    settingsWindow.loadFile(path.join(process.env.DIST!, "index.html"));
  }

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
  });
}

function createMonitoredAppsWindow() {
  monitoredAppsWindow = new BrowserWindow({
    title: "Monitored Apps",
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    skipTaskbar: true,
    minimizable: false,
    fullscreenable: false,
    width: 444,
    height: 620,
    minWidth: 320,
    minHeight: 320,
    autoHideMenuBar: true,
  });

  // Test active push message to Renderer-process.
  // monitoredAppsWindow.webContents.on("did-finish-load", async () => {
  //   const apps = await getAvailableApps();
  //   const appSettings = getAppSettings();
  // });

  if (VITE_DEV_SERVER_URL) {
    monitoredAppsWindow.loadURL(VITE_DEV_SERVER_URL + "monitored-apps");
  } else {
    // win.loadFile('dist/index.html')
    monitoredAppsWindow.loadFile(path.join(process.env.DIST!, "index.html"));
  }

  if (!app.isPackaged) {
    monitoredAppsWindow.webContents.openDevTools({ mode: "detach" });
  }

  monitoredAppsWindow.on("closed", () => {
    monitoredAppsWindow = null;
  });
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(
    path.join(process.env.VITE_PUBLIC!, "trayIconTemplate.png"),
  );
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

// Hide app from macOS doc
if (isMacOS) {
  app.dock.hide();
}

app.on("window-all-closed", () => {});

app.on("activate", () => {});

function activeWindowChange(window: WindowInfo) {
  console.log({
    time: new Date().toISOString(),
    app: window.info.name,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onKeyEvent(e: IGlobalKeyEvent, _down: IGlobalKeyDownMap) {
  console.log(
    `${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey?._nameRaw}]`,
  );
}

app.whenReady().then(() => {
  createTray();
  subscribeActiveWindow(activeWindowChange);
  gkl.addListener(onKeyEvent);
});

app.on("quit", () => {
  unsubscribeAllActiveWindow();
  gkl.removeListener(onKeyEvent);
});

ipcMain.on(GET_APP_SETTINGS_IPC_KEY, (event) => {
  const settings = getAppSettings();
  event.returnValue = settings;
});

ipcMain.on(SET_APP_SETTINGS_IPC_KEY, (_, value) => {
  setAppSettings(value);
});

ipcMain.on(GET_INSTALLED_APPS_IPC_KEY, async (event) => {
  try {
    const apps = await getAvailableApps();
    event.returnValue = apps;
  } catch (error) {
    console.error(error);
    event.returnValue = [];
  }
});

ipcMain.on(GET_APP_VERSION_IPC_KEY, (event) => {
  event.returnValue = app.getVersion();
});
