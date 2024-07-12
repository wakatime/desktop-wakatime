import { allApps } from "../watchers";
import { getInstalledApps } from "../installed-apps";
import { getIconFromWindows, getPath } from "../installed-apps/windows";
import { AppInfo } from "~/types/app-info";
import { getAppIconMac } from "../installed-apps/mac";

export async function getAvailableApps() {
  const installedApps = await getInstalledApps();
  console.log(installedApps);

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
          const name = record["DisplayName"];
          const path = await getPath(record, app.windows.exePath);
          if (!path || !name) {
            return null;
          }

          let icon: string | null = null;

          try {
            icon = getIconFromWindows(path);
          } catch (error) {
            /* empty */
          }

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
          const name = record["kMDItemDisplayName"]?.replace(".app", "");
          const path = record["_FILE_PATH"];
          if (!path || !name) {
            return;
          }
          const icon = await getAppIconMac(path);

          return { path, icon, name };
        }

        return null;
      }),
    )
  ).filter(Boolean) as AppInfo[];
}
