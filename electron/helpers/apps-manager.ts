import fs from "node:fs";
import path from "node:path";
import { isBefore, subHours } from "date-fns";
import { app } from "electron";
import { Logging } from "electron/utils/logging";
import { z } from "zod";

import type { AppData } from "../utils/validators";
import { appDataSchema } from "../utils/validators";
import { getApps } from "./installed-apps";

const appsFileContentSchema = z.object({
  storedAt: z.string(),
  apps: z.array(appDataSchema).min(1),
});

export class AppsManager {
  apps: AppData[] = [];
  static _instacneCache?: AppsManager;

  static instance(): AppsManager {
    if (!this._instacneCache) {
      this._instacneCache = new this();
    }
    return this._instacneCache;
  }

  loadApps() {
    const cacheFilePath = path.join(
      app.getPath("appData"),
      "WakaTime",
      "wakatime-apps.json",
    );

    try {
      const data = fs.readFileSync(cacheFilePath, { encoding: "utf-8" });
      const content = appsFileContentSchema.parse(JSON.parse(data));
      if (!isBefore(new Date(content.storedAt), subHours(new Date(), 1))) {
        this.apps = content.apps;
        return;
      }
    } catch (error) {}

    (async () => {
      const apps = await getApps();
      this.apps = apps;

      try {
        fs.writeFileSync(
          cacheFilePath,
          JSON.stringify({
            storedAt: new Date().toISOString(),
            apps,
          } satisfies z.infer<typeof appsFileContentSchema>),
        );
      } catch (error) {
        Logging.instance().log(
          `Failed to log to file: ${cacheFilePath}. Error: ${error}`,
        );
      }
    })();
  }

  getApp(path: string) {
    return this.apps.find((app) => app.path === path);
  }
}
