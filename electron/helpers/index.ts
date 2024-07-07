import { allApps } from "../watchers";
import { getInstalledApps } from "../installed-apps";
import { getAppIcon } from "../installed-apps/windows";
import { AppData } from "~/types/app-data";

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

          const appIcon = await getAppIcon(record, app);
          const appName = record["DisplayName"];

          return { ...record, appIcon, appName };
        }

        return null;
      }),
    )
  ).filter(Boolean) as AppData[];
}
