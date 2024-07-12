import path from "node:path";
import fs from "node:fs";
import Winreg from "winreg";

export async function getPath(
  appData: Record<string, string>,
  fileName?: string,
) {
  const installLocation = appData["InstallLocation"];
  if (!installLocation) {
    return null;
  }

  if (!fileName) {
    const files = await fs.readdirSync(installLocation);
    fileName = files.find((file) => file.endsWith(".exe"));
  }

  if (!fileName) {
    return null;
  }

  return path.join(installLocation, fileName);
}

export async function getIconFromWindows(path: string) {
  if (process.platform !== "win32") {
    return;
  }

  const iconExtractor = await import("icon-extractor");
  return new Promise<string>((resolve, reject) => {
    function onIcon(data: { Context: string; Base64ImageData: string }) {
      if (data.Context === path) {
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

    iconExtractor.getIcon(path, path);
  });
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
