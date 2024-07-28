import { exec } from "child_process";
import { WindowInfo } from "@miniben90/x-win";
import { app, Notification, shell } from "electron";

import type { Category, EntityType } from "../utils/types";
import type { AppData } from "../utils/validators";
import { AppsManager } from "../helpers/apps-manager";
import { ConfigFile } from "../helpers/config-file";
import { Dependencies } from "../helpers/dependencies";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { PropertiesManager } from "../helpers/properties-manager";
import { SettingsManager } from "../helpers/settings-manager";
import { getCLIPath, getDeepLinkUrl, getPlatfrom } from "../utils";
import { DeepLink } from "../utils/constants";
import { Logging } from "../utils/logging";

export class Wakatime {
  private lastEntitiy = "";
  private lastTime: number = 0;
  private lastCategory: Category = "coding";

  async init() {
    if (PropertiesManager.shouldLogToFile) {
      Logging.instance().activateLoggingToFile();
    }

    Logging.instance().log("Starting Wakatime");

    if (SettingsManager.shouldRegisterAsLogInItem()) {
      SettingsManager.registerAsLogInItem();
    }

    // TODO: Move them to a background task
    await Dependencies.installDependencies();
    await AppsManager.load();

    this.checkForApiKey();

    if (!PropertiesManager.hasLaunchedBefore) {
      const allApps = AppsManager.getApps();
      for (const app of allApps) {
        if (app.isDefaultEnabled) {
          MonitoringManager.set(app.path, true);
        }
      }
      PropertiesManager.hasLaunchedBefore = true;
    }

    if (MonitoringManager.isBrowserMonitored()) {
      // TODO: Move it to background task
      const browser = await Dependencies.recentBrowserExtension();
      if (browser && Notification.isSupported()) {
        const notification = new Notification({
          title: "Warning",
          subtitle: `WakaTime ${browser} extension detected. It’s recommended to only track browsing activity with the ${browser} extension or The Desktop app, but not both.`,
        });
        notification.show();
      }
    }
  }

  checkForApiKey() {
    const key = ConfigFile.getSetting("settings", "api_key");
    if (!key) {
      this.openSettingsDeeplink();
    }
  }

  openSettingsDeeplink() {
    shell.openExternal(getDeepLinkUrl(DeepLink.settings));
  }

  private shouldSendHeartbeat(
    entity: string,
    time: number,
    isWrite: boolean,
    category: Category,
  ) {
    if (isWrite) {
      return true;
    }
    if (category !== this.lastCategory) {
      return true;
    }
    if (entity && this.lastEntitiy !== entity) {
      return true;
    }
    if (this.lastTime + 120 < time) {
      return true;
    }
  }

  async sendHeartbeat(props: {
    appData: AppData;
    windowInfo: WindowInfo;
    entity: string;
    entityType: EntityType;
    category: Category | null;
    project: string | null;
    language: string | null;
    isWrite: boolean;
  }) {
    const {
      appData,
      entity,
      entityType,
      isWrite,
      language,
      project,
      windowInfo,
    } = props;
    const category = props.category ?? "coding";
    const time = Date.now() / 1000;

    if (!this.shouldSendHeartbeat(entity, time, isWrite, category)) {
      return;
    }
    if (!MonitoringManager.isMonitored(appData.path)) {
      return;
    }

    const appName = windowInfo?.info.name ?? appData.name;
    const appVersion = appData.version;
    if (!appName || !appVersion) {
      return;
    }

    const args: string[] = [
      "--entity",
      entity,
      "--entity-type",
      entityType,
      "--category",
      category,
      "--plugin",
      `${appName}/${appVersion} ${getPlatfrom()}-wakatime/${app.getVersion()}`,
    ];

    if (project) {
      args.push("--project", project);
    }
    if (isWrite) {
      args.push("--write");
    }
    if (language) {
      args.push("--language", language);
    }

    Logging.instance().log(`Sending heartbeat with: ${args}`);

    this.lastEntitiy = entity;
    this.lastCategory = category;
    this.lastTime = time;

    const cli = getCLIPath();

    try {
      await new Promise((resolve, reject) => {
        const command = `${cli} ${args.join(" ")}`;
        console.log(`Executing Command: "${command}"`);
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          }
          if (stderr) {
            reject(stderr);
          }
          resolve(stdout);
        });
      });
    } catch (error) {
      Logging.instance().log(
        `Failed to run wakatime-cli: ${cli}. Error: ${error}`,
      );
    }
  }
}
