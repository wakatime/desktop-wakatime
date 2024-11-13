import { LogLevel, Logging } from "../utils/logging";

import type { AppData } from "../utils/validators";
import { appDataSchema } from "../utils/validators";
import { excludeAppsList } from "../watchers/apps";
import fs from "node:fs";
import { getApps } from "./installed-apps";
import { getWakatimeAppDataFolderPath } from "../utils";
import path from "node:path";
import { z } from "zod";

const wakatimeAppsSchema = z.object({
  installedApps: z.array(appDataSchema),
  extraApps: z.array(appDataSchema),
});

const validateExtraApps = (apps: AppData[]) => {
  return apps.filter((app) => {
    return fs.existsSync(app.path);
  });
};

export class AppsManager {
  cacheFilePath: string;
  installedApps: AppData[] = [];
  extraApps: AppData[] = [];

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

  private getCachedApps(): z.infer<typeof wakatimeAppsSchema> {
    try {
      const data = fs.readFileSync(this.cacheFilePath, { encoding: "utf-8" });
      const apps = wakatimeAppsSchema.parse(JSON.parse(data));
      return apps;
    } catch (_error) {
      /* empty */
    }
    return { installedApps: [], extraApps: [] };
  }

  private setCachedApps(data: z.infer<typeof wakatimeAppsSchema>) {
    try {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(data));
    } catch (error) {
      Logging.instance().log(
        `Failed to log to file: ${this.cacheFilePath}. Error: ${error}`,
        LogLevel.ERROR,
      );
    }
  }

  private saveCache() {
    this.setCachedApps({
      extraApps: this.extraApps,
      installedApps: this.installedApps,
    });
  }

  async loadApps() {
    const { installedApps, extraApps } = this.getCachedApps();
    this.installedApps = installedApps.filter(
      (app) => !AppsManager.isExcludedApp(app),
    );
    this.extraApps = validateExtraApps(extraApps).filter(
      (app) => !AppsManager.isExcludedApp(app),
    );
    this.installedApps = await getApps();
    this.saveCache();
    return [...this.installedApps, ...this.extraApps];
  }

  getApp(path: string) {
    return this.getAllApps().find((app) => app.path === path);
  }

  getAllApps() {
    return [...this.installedApps, ...this.extraApps];
  }

  addExtraApp(app: AppData) {
    if (AppsManager.isExcludedApp(app)) {
      return;
    }
    if (this.getApp(app.path)) {
      return;
    }
    this.extraApps = [...this.extraApps, app];
    this.saveCache();
  }

  removeExtraApp(path: string) {
    this.extraApps = this.extraApps.filter((app) => app.path !== path);
    this.saveCache();
  }

  isInstalledApp(path: string) {
    const app = this.installedApps.find((app) => app.path === path);
    return !!app;
  }

  isExtraApp(path: string) {
    const app = this.extraApps.find((app) => app.path === path);
    return !!app;
  }

  static isExcludedApp(app: AppData) {
    return !!excludeAppsList.find((item) => {
      if (item.bundleId && item.bundleId === app.bundleId) {
        return true;
      }
      if (item.execName && item.execName === app.execName) {
        return true;
      }
      if (item.name) {
        if (typeof item.name === "string") {
          return item.name === app.name;
        } else {
          return item.name.test(app.name);
        }
      }
      return false;
    });
  }
}
