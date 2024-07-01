import { getInstalledApps } from "../installed-apps";
import { allApps } from "../watchers";
import { AppData } from "~/types/app-data";

// export async function checkIfAppInstalledOnWindows(registryPaths: string[]) {
//   return new Promise<boolean>((resolve) => {
//     const psCommands = registryPaths
//       .map(
//         (path) =>
//           `$appPath = (Get-ItemProperty -Path '${path}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty '(default)' -ErrorAction SilentlyContinue); if ($appPath) { Write-Output $appPath; }`,
//       )
//       .join(" ");

//     exec(`powershell -command "${psCommands}"`, (err, stdout) => {
//       if (err) {
//         console.error("Error:", err);
//         resolve(false);
//         return;
//       }

//       const appPaths = stdout.trim().split("\n").filter(Boolean);
//       resolve(appPaths.length > 0);
//     });
//   });
// }

// export async function checkIfAppInstalledOnMacOS(bundleId: string) {
//   return new Promise<boolean>((resolve) => {
//     const command = `mdfind "kMDItemCFBundleIdentifier == '${bundleId}'"`;

//     exec(command, (err, stdout) => {
//       if (err) {
//         console.error("Error:", err);
//         resolve(false);
//         return;
//       }

//       const appPaths = stdout.trim().split("\n").filter(Boolean);
//       resolve(appPaths.length > 0);
//     });
//   });
// }

// export async function checkIfAppInstalled(appData: AppData) {
//   if (process.platform === "darwin") {
//     if (!appData.mac) {
//       return false;
//     }
//     return checkIfAppInstalledOnMacOS(appData.mac.bundleId);
//   }

//   if (process.platform === "win32") {
//     if (!appData.windows) {
//       return false;
//     }
//     return checkIfAppInstalledOnWindows(appData.windows.registryPaths);
//   }
//   return false;
// }

export async function getAvailableApps() {
  const installedApps = await getInstalledApps();

  return allApps
    .filter((app) => {
      if (process.platform === "darwin") {
        return app.mac?.bundleId;
      }
      if (process.platform === "win32") {
        return app.windows?.registryPaths;
      }
      return false;
    })
    .map((app) =>
      installedApps.find((ad) => {
        if (
          process.platform === "darwin" &&
          ad.type === "mac" &&
          ad.appIdentifier === app.mac?.bundleId
        ) {
          return true;
        }
        return false;
      }),
    )
    .filter(Boolean) as AppData[];
}
