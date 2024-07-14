import path from "node:path";
import fs from "node:fs";
import Winreg from "winreg";
import { extractIcon } from "@inithink/exe-icon-extractor";
import { store } from "../../store";

export async function getFilePath(
  appData: Record<string, string>,
  fileName?: string,
) {
  const installLocation = appData["InstallLocation"];
  if (!installLocation) {
    return null;
  }

  const cachedFilePath = store.get(`${installLocation}-filepath`);
  if (typeof cachedFilePath === "string") {
    return cachedFilePath;
  }

  if (!fileName) {
    const files = await fs.readdirSync(installLocation);
    fileName = files.find((file) => file.endsWith(".exe"));
  }

  if (!fileName) {
    return null;
  }

  const filepath = path.join(installLocation, fileName);
  store.set(`${installLocation}-filepath`, filepath);
  return filepath;
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
    apps.push(...newApps);
  }

  return apps.filter((app) => app["DisplayName"]);
}
