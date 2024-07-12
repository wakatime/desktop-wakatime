import { allApps } from "../watchers";
import { getInstalledApps } from "../installed-apps";
import { getIconFromWindows, getPath } from "../installed-apps/windows";
import { AppInfo } from "~/types/app-data";
import { getAppIconMac } from "../installed-apps/mac";

export async function getAvailableApps() {
  const installedApps = await getInstalledApps();

  return (
    await Promise.all(
      allApps.map<Promise<AppInfo | null | undefined>>(async (app) => {
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
          const path = await getPath(record);
          if (!path) {
            return null;
          }

          const icon = await getIconFromWindows(path);
          const name = record["DisplayName"];

          return { icon, name, path };
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
          const path = record["_FILE_PATH"];
          if (!path) {
            return;
          }
          const icon = await getAppIconMac(path);
          const name = record["kMDItemDisplayName"].replace(".app", "");

          return { path, icon, name };
        }

        return null;
      }),
    )
  ).filter(Boolean) as AppInfo[];
}
