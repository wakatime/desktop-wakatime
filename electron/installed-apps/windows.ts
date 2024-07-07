import { MonitoredAppInfo } from "electron/watchers";
import path from "node:path";
import fs from "node:fs";
import Winreg from "winreg";
import { AppData } from "~/types/app-data";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const iconExtractor = require("icon-extractor");

iconExtractor.emitter.setMaxListeners(50);

export async function getIconFromExePath(path: string, context: string) {
  return new Promise<string>((resolve, reject) => {
    function onIcon(data: { Context: string; Base64ImageData: string }) {
      if (data.Context === context) {
        iconExtractor.emitter.off("icon", onIcon);
        iconExtractor.emitter.off("error", onError);
        resolve("data:image/png;base64," + data.Base64ImageData);
      }
    }

    function onError(error: unknown) {
      iconExtractor.emitter.off("icon", onIcon);
      iconExtractor.emitter.off("error", onError);
      reject(error);
    }

    iconExtractor.emitter.on("icon", onIcon);
    iconExtractor.emitter.on("error", onError);

    iconExtractor.getIcon(context, path);
  });
}

export async function getAppIcon(appData: AppData, app?: MonitoredAppInfo) {
  let exeFilePath = appData["DisplayIcon"]?.replace(",0", "").trim();
  if (
    (!exeFilePath || !exeFilePath?.endsWith(".exe")) &&
    appData["InstallLocation"]
  ) {
    let file = app?.windows?.exePath;
    if (!file) {
      const files = await fs.readdirSync(appData["InstallLocation"]);
      file = files.find((file) => file.endsWith(".exe"));
    }
    if (file) {
      exeFilePath = path.join(appData["InstallLocation"], file);
    }
  }

  if (exeFilePath) {
    const exists = await fs.existsSync(exeFilePath);
    if (exists) {
      try {
        const icon = await getIconFromExePath(exeFilePath, exeFilePath);
        if (typeof icon === "string") {
          exeFilePath = icon;
        }
      } catch (error) {
        console.error("Failed to load icon", error);
      }
    }
  }
  return exeFilePath;
}

export async function getApp(reg: Winreg.Registry) {
  const app = await new Promise<Record<string, string>>((res, rej) => {
    reg.values((err, items) => {
      if (err) {
        rej(err);
      } else {
        const app: Record<string, string> = {};
        items.forEach((item) => {
          app[item.name] = item.value;
        });
        res(app);
      }
    });
  });

  return app;
}

export async function getApps(regKey: Winreg.Registry) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    regKey.keys(async (err, keys) => {
      if (err) {
        reject(err);
      } else {
        const apps = await Promise.all(keys.map(async (reg) => getApp(reg)));
        resolve(apps);
      }
    });
  });
}

export async function getInstalledApps() {
  if (process.platform !== "win32") {
    return [];
  }
  const registries = [
    new Winreg({
      hive: Winreg.HKLM,
      key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    }),
    new Winreg({
      hive: Winreg.HKLM,
      key: "\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    }),
    new Winreg({
      hive: Winreg.HKCU,
      key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    }),
    new Winreg({
      hive: Winreg.HKCU,
      key: "\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    }),
  ];

  const apps = (await Promise.all(registries.map((reg) => getApps(reg))))
    .flatMap((apps) => apps)
    .filter((app) => app["DisplayName"]);
  return apps;
}
