import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import type { AppData } from "../utils/validators";
import { getWakatimeAppDataFolderPath } from "../utils";
import { Logging, LogLevel } from "../utils/logging";
import { appDataSchema } from "../utils/validators";
import { getApps } from "./installed-apps";

export class AppsManager {
  cacheFilePath: string;
  apps: AppData[] = [];
  static _instacneCache?: AppsManager;

  constructor() {
    this.cacheFilePath = path.join(
      getWakatimeAppDataFolderPath(),
      "wakatime-apps.json",
    );
  }

  static instance(): AppsManager {
    if (!this._instacneCache) {
      this._instacneCache = new this();
    }
    return this._instacneCache;
  }

  private getCachedApps() {
    try {
      const data = fs.readFileSync(this.cacheFilePath, { encoding: "utf-8" });
      const apps = z.array(appDataSchema).parse(JSON.parse(data));
      return apps;
    } catch (_error) {
      /* empty */
    }
    return [];
  }

  private setCachedApps(apps: AppData[]) {
    try {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(apps));
    } catch (error) {
      Logging.instance().log(
        `Failed to log to file: ${this.cacheFilePath}. Error: ${error}`,
        LogLevel.ERROR,
      );
    }
  }

  async loadApps() {
    this.apps = this.getCachedApps();
    this.apps = await getApps();
    this.setCachedApps(this.apps);
    return this.apps;
  }

  getApp(path: string) {
    return this.apps.find((app) => app.path === path);
  }
}
