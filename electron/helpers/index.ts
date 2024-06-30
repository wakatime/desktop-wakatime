import { AppData, allApps } from "../watchers";
import { exec } from "child_process";

export async function checkIfAppInstalledOnWindows(registryPaths: string[]) {
  return new Promise<boolean>((resolve) => {
    const psCommands = registryPaths
      .map(
        (path) =>
          `$appPath = (Get-ItemProperty -Path '${path}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty '(default)' -ErrorAction SilentlyContinue); if ($appPath) { Write-Output $appPath; }`,
      )
      .join(" ");

    exec(`powershell -command "${psCommands}"`, (err, stdout) => {
      if (err) {
        console.error("Error:", err);
        resolve(false);
        return;
      }

      const appPaths = stdout.trim().split("\n").filter(Boolean);
      resolve(appPaths.length > 0);
    });
  });
}

export async function checkIfAppInstalledOnMacOS(bundleId: string) {
  return new Promise<boolean>((resolve) => {
    const command = `mdfind "kMDItemCFBundleIdentifier == '${bundleId}'"`;

    exec(command, (err, stdout) => {
      if (err) {
        console.error("Error:", err);
        resolve(false);
        return;
      }

      const appPaths = stdout.trim().split("\n").filter(Boolean);
      resolve(appPaths.length > 0);
    });
  });
}

export async function checkIfAppInstalled(appData: AppData) {
  if (process.platform === "darwin") {
    if (!appData.mac) {
      return false;
    }
    return checkIfAppInstalledOnMacOS(appData.mac.bundleId);
  }

  if (process.platform === "win32") {
    if (!appData.windows) {
      return false;
    }
    return checkIfAppInstalledOnWindows(appData.windows.registryPaths);
  }
  return false;
}

export async function getAvailableApps() {
  const apps = (
    await Promise.all(
      allApps.map(async (app) => {
        const isInstalled = await checkIfAppInstalled(app);
        if (isInstalled) {
          return app;
        }
        return null;
      }),
    )
  ).filter(Boolean) as AppData[];
  return apps;
}
