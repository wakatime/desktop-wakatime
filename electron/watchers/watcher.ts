import {
  activeWindow,
  subscribeActiveWindow,
  unsubscribeActiveWindow,
  WindowInfo,
} from "@miniben90/x-win";
import { powerMonitor } from "electron";

import { AppsManager } from "../helpers/apps-manager";
import { MonitoredApp } from "../helpers/monitored-app";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { Logging, LogLevel } from "../utils/logging";
import { Wakatime } from "./wakatime";

export class Watcher {
  wakatime: Wakatime;
  activeWindow?: WindowInfo;
  private activeWindowSubscription: number | null;
  private interval: NodeJS.Timeout | null;

  constructor(wakatime: Wakatime) {
    this.wakatime = wakatime;
    this.activeWindowSubscription = null;
    this.interval = null;
  }

  private handleActivity() {
    try {
      const window = activeWindow();
      if (!MonitoringManager.isMonitored(window.info.path)) {
        return;
      }

      const app = AppsManager.instance().getApp(window.info.path);
      const heartbeatData = MonitoredApp.heartbeatData(window, app);
      if (!heartbeatData) {
        return;
      }

      this.wakatime.sendHeartbeat({
        appData: app,
        windowInfo: window,
        project: heartbeatData.project,
        entity: heartbeatData.entity,
        entityType: "app",
        category: heartbeatData.category,
        language: heartbeatData.language,
        isWrite: false,
      });
    } catch (error) {
      Logging.instance().log((error as Error).message, LogLevel.ERROR, true);
    }
  }

  start() {
    this.stop();
    this.activeWindowSubscription = subscribeActiveWindow(
      (windowInfo: WindowInfo) => {
        if (!windowInfo.info.processId) return;
        if (this.activeWindow?.info.processId === windowInfo.info.processId) {
          return;
        }

        Logging.instance().log(
          `App changed from ${this.activeWindow?.info.name || "nil"} to ${windowInfo.info.name}`,
        );
        this.activeWindow = windowInfo;

        this.handleActivity();
      },
    );
    this.interval = setInterval(() => {
      const idleState = powerMonitor.getSystemIdleState(10);
      if (idleState === "active") {
        this.handleActivity();
      }
    }, 5000);
  }

  stop() {
    if (this.activeWindowSubscription !== null) {
      unsubscribeActiveWindow(this.activeWindowSubscription);
    }
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
  }
}
