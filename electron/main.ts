import path from "node:path";
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

import { AppsManager } from "./helpers/apps-manager";
import { ConfigFile } from "./helpers/config-file";
import { Dependencies } from "./helpers/dependencies";
import { MonitoringManager } from "./helpers/monitoring-manager";
import {
  DomainPreferenceType,
  FilterType,
  PropertiesManager,
} from "./helpers/properties-manager";
import { getDesktopWakaTimeConfigFilePath, getLogFilePath } from "./utils";
import {
  GET_APP_VERSION_IPC_KEY,
  GET_INSTALLED_APPS_IPC_KEY as GET_APPS_IPC_KEY,
  GET_SETTING_IPC_KEY,
  IS_MONITORED_KEY,
  SET_MONITORED_KEY,
  SET_SETTING_IPC_KEY,
} from "./utils/constants";
import { Logging } from "./utils/logging";
import { Wakatime } from "./watchers/wakatime";
import { Watcher } from "./watchers/watcher";

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
let watcher: Watcher | null = null;
let wakatime: Wakatime;
let dependencies: Dependencies;

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
    height: MonitoringManager.isBrowserMonitored() ? 768 : 320,
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

app.whenReady().then(async () => {
  // TODO: Check if properties if we should activate logging to file or not
  if (PropertiesManager.shouldLogToFile) {
    Logging.instance().activateLoggingToFile();
  }

  Logging.instance().log("Starting Wakatime");

  dependencies = new Dependencies();
  wakatime = new Wakatime();
  watcher = new Watcher(wakatime);

  // TODO: Move them to a background task
  await dependencies.installDependencies();
  await AppsManager.load();

  createTray();

  watcher.start();

  console.log(getDesktopWakaTimeConfigFilePath());
});

app.on("quit", () => {
  Logging.instance().log("WakaTime will terminate");
  watcher?.stop();
});

ipcMain.on(
  GET_SETTING_IPC_KEY,
  (event, section: string, key: string, internal: boolean = false) => {
    event.returnValue = ConfigFile.getSetting(section, key, internal);
  },
);

ipcMain.on(
  SET_SETTING_IPC_KEY,
  (
    _event,
    section: string,
    key: string,
    value: string,
    internal: boolean = false,
  ) => {
    ConfigFile.setSetting(section, key, value, internal);
  },
);

ipcMain.on(GET_APPS_IPC_KEY, (event) => {
  event.returnValue = AppsManager.getApps();
});

ipcMain.on(GET_APP_VERSION_IPC_KEY, (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on(IS_MONITORED_KEY, (event, path) => {
  event.returnValue = MonitoringManager.isMonitored(path);
});

ipcMain.on(SET_MONITORED_KEY, (_event, path: string, monitor: boolean) => {
  MonitoringManager.set(path, monitor);
});

ipcMain.on("should_log_to_file", (event) => {
  event.returnValue = PropertiesManager.shouldLogToFile;
});
ipcMain.on("set_should_log_to_file", (_event, value) => {
  PropertiesManager.shouldLogToFile = value;
});

ipcMain.on("should_launch_on_login", (event) => {
  event.returnValue = PropertiesManager.shouldLaunchOnLogin;
});
ipcMain.on("set_should_launch_on_login", (_event, value) => {
  PropertiesManager.shouldLaunchOnLogin = value;
});

ipcMain.on("log_file_path", (event) => {
  event.returnValue = getLogFilePath();
});

ipcMain.on("is_browser_monitored", (event) => {
  event.returnValue = MonitoringManager.isBrowserMonitored();
});

ipcMain.on("get_domain_preference", (event) => {
  event.returnValue = PropertiesManager.domainPreference;
});
ipcMain.on("set_domain_preference", (_event, value: DomainPreferenceType) => {
  PropertiesManager.domainPreference = value;
});

ipcMain.on("get_filter_type", (event) => {
  event.returnValue = PropertiesManager.filterType;
});
ipcMain.on("set_filter_type", (_event, value: FilterType) => {
  PropertiesManager.filterType = value;
});

ipcMain.on("get_denylist", (event) => {
  event.returnValue = PropertiesManager.denylist;
});
ipcMain.on("set_denylist", (_event, value: string) => {
  PropertiesManager.denylist = value;
});

ipcMain.on("get_allowlist", (event) => {
  event.returnValue = PropertiesManager.allowlist;
});
ipcMain.on("set_allowlist", (_event, value: string) => {
  PropertiesManager.allowlist = value;
});
