import { exec } from "child_process";
import { WindowInfo } from "@miniben90/x-win";
import { app } from "electron";
import { ConfigFile } from "electron/helpers/config-file";

import type { Category, EntityType } from "../utils/types";
import type { AppData } from "../utils/validators";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { getCLIPath, getPlatfrom } from "../utils";
import { Logging } from "../utils/logging";

export class Wakatime {
  private lastEntitiy = "";
  private lastTime: number = 0;
  private lastCategory: Category = "coding";

  openSettingsDeeplink() {
    // TODO: Open Settings Window
  }

  checkForApiKey() {
    const key = ConfigFile.getSetting("settings", "api_key");
    if (!key) {
      this.openSettingsDeeplink();
    }
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
    windowInfo?: WindowInfo;
    entity: string;
    entityType: EntityType;
    category?: Category;
    project?: string;
    language?: string;
    isWrite: boolean;
  }) {
    const {
      appData: appData,
      category = "coding",
      entity,
      entityType,
      isWrite,
      language,
      project,
      windowInfo,
    } = props;
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
