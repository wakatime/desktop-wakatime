import fs from "node:fs";
import path from "node:path";
import { AppData } from "electron/utils/validators";
import Winreg from "winreg";

import { Store } from "../../store";
import { allApps } from "../../watchers/apps";

function getFilePath(appData: Record<string, string>, fileName?: string) {
  try {
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
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getIcon(filePath: string) {
  try {
    if (process.platform !== "win32") {
      return null;
    }

    const cachedIcon = Store.instance().get(`${filePath}-icon`);
    if (typeof cachedIcon === "string") {
      return cachedIcon;
    }
    const { extractIcon } = await import("exe-icon-extractor");

    const buffer = extractIcon(filePath, "large");
    const icon = "data:image/png;base64," + buffer.toString("base64");
    Store.instance().set(`${filePath}-icon`, icon);
    return icon;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function registryValues(reg: Winreg.Registry) {
  return await new Promise<Record<string, string>>((res, rej) => {
    reg.values((err, items) => {
      if (err) {
        rej(err);
      } else {
        const record: Record<string, string> = {};
        items.forEach((item) => {
          record[item.name] = item.value;
        });
        res(record);
      }
    });
  });
}

export async function getApp(reg: Winreg.Registry) {
  const record = await registryValues(reg);
  const name = record["DisplayName"];
  if (!name) {
    return undefined;
  }

  const app = allApps.find((app) => {
    return (
      app.windows?.DisplayName &&
      record["DisplayName"].startsWith(app.windows.DisplayName)
    );
  });

  const filePath = getFilePath(record, app?.windows?.exePath);
  if (!filePath) {
    return undefined;
  }

  const icon = record["DisplayIcon"]
    ? await getIcon(record["DisplayIcon"])
    : await getIcon(filePath);

  return {
    id: app?.id ?? name,
    icon,
    name,
    version: record["DisplayVersion"],
    path: filePath,
    bundleId: app?.mac?.bundleId ?? null,
    isBrowser: app?.isBrowser ?? false,
    isDefaultEnabled: app?.isDefaultEnabled ?? false,
    isElectronApp: app?.isElectronApp ?? false,
    execName: path.parse(filePath).base,
  } satisfies AppData;
}

export async function getApps(regKey: Winreg.Registry) {
  return new Promise<AppData[]>((resolve, reject) => {
    regKey.keys(async (err, keys) => {
      if (err) {
        reject(err);
      } else {
        const apps = (
          await Promise.all(keys.map(async (reg) => getApp(reg)))
        ).filter(Boolean) as AppData[];
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

  const apps: AppData[] = [];
  for (const registry of registries) {
    apps.push(...(await getApps(registry)));
  }
  return apps;
}
