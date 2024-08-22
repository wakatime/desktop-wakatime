import path from "node:path";

import { AppData } from "../../utils/validators";
import { allApps } from "../../watchers/apps";
import { getAppIconMac, getInstalledApps as getInstalledAppsMac } from "./mac";
import {
  getFilePathWindows,
  getIconFromWindows,
  getInstalledApps as getInstalledAppsWindows,
} from "./windows";

export async function getInstalledApps(): Promise<Record<string, string>[]> {
  let apps: Record<string, string>[] = [];

  if (process.platform === "win32") {
    apps = await getInstalledAppsWindows();
  } else if (process.platform === "darwin") {
    apps = await getInstalledAppsMac();
  }

  return apps;
}

export async function getApps(): Promise<AppData[]> {
  const installedApps = await getInstalledApps();
  const apps = (
    await Promise.all(
      allApps.map(async (app) => {
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

          let filePath: string | null = null;
          try {
            filePath = getFilePathWindows(record, app.windows.exePath);
          } catch (error) {
            /* empty */
          }
          if (!filePath) {
            return null;
          }

          let icon: string | null = null;
          try {
            icon = await getIconFromWindows(filePath);
          } catch (error) {
            /* empty */
          }

          const name = record["DisplayName"];
          if (!name) {
            return null;
          }
          const version = record["DisplayVersion"];

          return {
            id: app.id,
            icon,
            name,
            version,
            path: filePath,
            bundleId: app.mac?.bundleId ?? null,
            isBrowser: app.isBrowser ?? false,
            isDefaultEnabled: app.isDefaultEnabled ?? false,
            isElectronApp: app.isElectronApp ?? false,
            execName: path.parse(filePath).base,
          } satisfies AppData;
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
          const execName = record["kMDItemDisplayName"];
          const name = execName?.replace(".app", "");
          const filePath = record["_FILE_PATH"];
          if (!filePath || !name) {
            return;
          }
          const icon = await getAppIconMac(filePath);
          const version = record["kMDItemVersion"] || null;

          return {
            path: filePath,
            icon,
            name,
            bundleId: app.mac.bundleId,
            id: app.id,
            isBrowser: app.isBrowser ?? false,
            isDefaultEnabled: app.isDefaultEnabled ?? false,
            isElectronApp: app.isElectronApp ?? false,
            version,
            execName: path.parse(filePath).base,
          } satisfies AppData;
        }

        return null;
      }),
    )
  ).filter((app) => app !== null) as AppData[];
  return apps;
}
