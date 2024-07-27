import fs from "node:fs";
import path from "node:path";
import { isBefore, subHours } from "date-fns";
import { app } from "electron";
import { z } from "zod";

import type { AppData } from "../utils/validators";
import { store } from "../store";
import { appDataSchema } from "../utils/validators";
import { allApps } from "../watchers";
import { getInstalledApps } from "./installed-apps";
import {
  getFilePathWindows,
  getIconFromWindows,
} from "./installed-apps/windows";

const APPS_KEY = "apps";

const appsFileContentSchema = z.object({
  storedAt: z.string(),
  apps: z.array(appDataSchema).min(1),
});

async function getApps(): Promise<AppData[]> {
  const installedApps = await getInstalledApps();
  const apps = allApps
    .map((app) => {
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
          icon = getIconFromWindows(filePath);
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
        } satisfies AppData;
      }

      // if (process.platform === "darwin" && app.mac?.bundleId) {
      //   const record = installedApps.find(
      //     (ia) =>
      //       ia["kMDItemCFBundleIdentifier"] &&
      //       app.mac?.bundleId &&
      //       ia["kMDItemCFBundleIdentifier"] === app.mac.bundleId,
      //   );

      //   if (!record) {
      //     return null;
      //   }
      //   const name = record["kMDItemDisplayName"]?.replace(".app", "");
      //   const path = record["_FILE_PATH"];
      //   if (!path || !name) {
      //     return;
      //   }
      //   const icon = await getAppIconMac(path);

      //   return { path, icon, name };
      // }

      return null;
    })
    .filter((app) => app !== null) as AppData[];
  return apps;
}

export abstract class AppsManager {
  static async load() {
    const cacheFilePath = path.join(
      app.getPath("userData"),
      "cache/wakatime-apps.json",
    );

    try {
      const data = fs.readFileSync(cacheFilePath, { encoding: "utf-8" });
      const content = appsFileContentSchema.parse(JSON.parse(data));
      if (!isBefore(new Date(content.storedAt), subHours(new Date(), 1))) {
        store.set(APPS_KEY, content.apps);
        return;
      }
    } catch (error) {}

    const apps = await getApps();
    store.set(APPS_KEY, apps);

    try {
      fs.writeFileSync(
        cacheFilePath,
        JSON.stringify({
          storedAt: new Date().toISOString(),
          apps,
        } satisfies z.infer<typeof appsFileContentSchema>),
      );
    } catch (error) {}
  }

  static getApps() {
    return store.get<AppData[]>(APPS_KEY) ?? [];
  }

  static getApp(path: string) {
    return this.getApps().find((app) => app.path === path);
  }
}
