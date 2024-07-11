import { allApps } from "../watchers";
import { getInstalledApps } from "../installed-apps";
import { getAppIconWindows } from "../installed-apps/windows";
import { AppData } from "~/types/app-data";
import { getAppIconMac } from "../installed-apps/mac";

export async function getAvailableApps() {
  const installedApps = await getInstalledApps();

  return (
    await Promise.all(
      allApps.map<Promise<AppData | null | undefined>>(async (app) => {
        if (process.platform === "win32" && app.windows?.DisplayName) {
          const record = installedApps.find(
            (ia) =>
              ia["DisplayName"] &&
              app.windows?.DisplayName &&
              ia["DisplayName"].startsWith(app.windows.DisplayName),
          );

          if (!record) {
            return null;
          }

          const appIcon = await getAppIconWindows(record, app);
          const appName = record["DisplayName"];

          return { ...record, appIcon, appName };
        }

        if (process.platform === "darwin" && app.mac?.bundleId) {
          const record = installedApps.find(
            (ia) =>
              ia["kMDItemCFBundleIdentifier"] &&
              app.mac?.bundleId &&
              ia["kMDItemCFBundleIdentifier"] === app.mac.bundleId,
          );

          if (!record) {
            return null;
          }

          const appIcon = await getAppIconMac(record["_FILE_PATH"]!);
          const appName = record["kMDItemDisplayName"].replace(".app", "");

          return { ...record, appIcon, appName };
        }

        return null;
      }),
    )
  ).filter(Boolean) as AppData[];
}
