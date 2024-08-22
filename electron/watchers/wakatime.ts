import { WindowInfo } from "@miniben90/x-win";
import { app, Notification, shell, Tray } from "electron";
import { updateElectronApp } from "update-electron-app";

import type { Category, EntityType } from "../utils/types";
import type { AppData } from "../utils/validators";
import { AppsManager } from "../helpers/apps-manager";
import { ConfigFile } from "../helpers/config-file";
import { Dependencies } from "../helpers/dependencies";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { PropertiesManager } from "../helpers/properties-manager";
import { SettingsManager } from "../helpers/settings-manager";
import { exec, getCLIPath, getDeepLinkUrl, getPlatfrom } from "../utils";
import { DeepLink } from "../utils/constants";
import { Logging, LogLevel } from "../utils/logging";

export class Wakatime {
  private lastEntitiy = "";
  private lastTime: number = 0;
  private lastCodeTimeFetched: number = 0;
  private lastCodeTimeText = "";
  private lastCategory: Category = "coding";
  private tray?: Tray | null;

  init(tray: Tray | null) {
    this.tray = tray;

    if (PropertiesManager.autoUpdateEnabled) {
      // https://github.com/electron/update-electron-app?tab=readme-ov-file#with-updateelectronjsorg
      // app will check for updates at startup, then every ten minutes
      updateElectronApp({
        logger: {
          log: (message) => Logging.instance().log(message, LogLevel.DEBUG),
          error: (message) => Logging.instance().log(message, LogLevel.ERROR),
          info: (message) => Logging.instance().log(message, LogLevel.INFO),
          warn: (message) => Logging.instance().log(message, LogLevel.WARN),
        },
      });
    }

    if (PropertiesManager.shouldLogToFile) {
      Logging.instance().activateLoggingToFile();
    }

    Logging.instance().log("Starting WakaTime");

    if (SettingsManager.shouldRegisterAsLogInItem()) {
      SettingsManager.registerAsLogInItem();
    }

    Dependencies.installDependencies();
    AppsManager.instance()
      .loadApps()
      .then((apps) => {
        if (!PropertiesManager.hasLaunchedBefore) {
          for (const app of apps) {
            if (app.isDefaultEnabled) {
              MonitoringManager.set(app.path, true);
            }
          }
          PropertiesManager.hasLaunchedBefore = true;
        }

        if (
          apps.find(
            (app) => app.isBrowser && MonitoringManager.isMonitored(app.path),
          )
        ) {
          (async () => {
            const browser = await Dependencies.recentBrowserExtension();
            if (browser && Notification.isSupported()) {
              const notification = new Notification({
                title: "Warning",
                subtitle: `WakaTime ${browser} extension detected. It’s recommended to only track browsing activity with the ${browser} extension or The Desktop app, but not both.`,
              });
              notification.show();
            }
          })();
        }
      });

    this.checkForApiKey();

    this.fetchToday();
  }

  checkForApiKey() {
    const key = ConfigFile.getSetting("settings", "api_key");
    if (!key) {
      this.openSettingsDeepLink();
    }
  }

  openSettingsDeepLink() {
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
    appData?: AppData;
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
    if (!MonitoringManager.isMonitored(windowInfo.info.path)) {
      return;
    }

    const appName = windowInfo.info.name ?? appData?.name;
    const appVersion = appData?.version;
    if (!appName) {
      return;
    }

    this.lastEntitiy = entity;
    this.lastCategory = category;
    this.lastTime = time;

    const args: string[] = [
      "--entity",
      entity,
      "--entity-type",
      entityType,
      "--category",
      category,
      "--plugin",
      `${appName}${appVersion ? `/${appVersion}` : ""} ${getPlatfrom()}-wakatime/${app.getVersion()}`,
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

    const cli = getCLIPath();
    Logging.instance().log(`Sending heartbeat: ${cli} ${args}`);

    try {
      const [_, err] = await exec(cli, ...args);
      if (err) {
        Logging.instance().log(
          `Error sending heartbeat: ${err}`,
          LogLevel.ERROR,
        );
      }
    } catch (error) {
      Logging.instance().log(`Failed to send heartbeat: ${error}`);
    }

    await this.fetchToday();
  }

  public async fetchToday() {
    if (!PropertiesManager.showCodeTimeInStatusBar) {
      this.tray?.setTitle("");
      return;
    }

    const time = Date.now() / 1000;
    if (this.lastCodeTimeFetched + 120 > time) {
      this.tray?.setTitle(` ${this.lastCodeTimeText}`);
      return;
    }

    this.lastCodeTimeFetched = time;

    const args: string[] = [
      "--today",
      "--today-hide-categories",
      "true",
      "--plugin",
      `${getPlatfrom()}-wakatime/${app.getVersion()}`,
    ];

    const cli = getCLIPath();
    Logging.instance().log(`Fetching code time: ${cli} ${args}`);

    try {
      const [output, err] = await exec(cli, ...args);
      if (err) {
        Logging.instance().log(
          `Error fetching code time: ${err}`,
          LogLevel.ERROR,
        );
        return;
      }
      this.lastCodeTimeText = output;
      this.tray?.setTitle(` ${output}`);
    } catch (error) {
      Logging.instance().log(
        `Failed to fetch code time: ${error}`,
        LogLevel.ERROR,
      );
    }
  }
}
