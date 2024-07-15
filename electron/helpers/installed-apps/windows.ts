import fs from "node:fs";
import path from "node:path";
import { extractIcon } from "@inithink/exe-icon-extractor";
import Winreg from "winreg";

import { store } from "../../store";

export async function getFilePath(
  appData: Record<string, string>,
  fileName?: string,
) {
  let installLocation = appData["InstallLocation"];
  if (!installLocation) {
    return null;
  }

  let files = fs.readdirSync(installLocation);

  // Some electron app has two exe file. One in the root install location and one in the app-{some-version-number} directory. eg.
  // 1: [install-location]/{fileName}.exe
  // 2: [install-location]/app-{some-version-number}/{fileName}.exe
  // And in window info they use second location as path
  const appFolder = files
    // sorting it to get the folder which has the latest version if there are many folders with `app-` name.
    .sort((a, b) => b.localeCompare(a))
    .find((file) => file.startsWith("app-"));
  if (appFolder) {
    const newLocation = path.join(installLocation, appFolder);
    const appFolderFiles = fs.readdirSync(newLocation);
    if (appFolderFiles.find((file) => file.endsWith(".exe"))) {
      installLocation = newLocation;
      files = appFolderFiles;
    }
  }

  if (!fileName) {
    fileName = files.find((file) => file.endsWith(".exe"));
  }

  if (!fileName) {
    return null;
  }

  const filePath = path.join(installLocation, fileName);
  return filePath;
}

export function getIconFromWindows(filePath: string) {
  if (process.platform !== "win32") {
    return null;
  }

  const cachedIcon = store.get(`${filePath}-icon`);
  if (typeof cachedIcon === "string") {
    return cachedIcon;
  }

  const buffer = extractIcon(filePath, "large");
  const icon = "data:image/png;base64," + buffer.toString("base64");
  store.set(`${filePath}-icon`, icon);
  return icon;
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

  const apps: Record<string, string>[] = [];

  // const apps = (await Promise.all(registries.map((reg) => getApps(reg))));
  for (const registry of registries) {
    const newApps = await getApps(registry);
    apps.push(...newApps.filter((app) => app["DisplayName"]));
  }

  return apps;
}
