import type { IGlobalKeyListener } from "node-global-key-listener";
import {
  activeWindow,
  subscribeActiveWindow,
  unsubscribeActiveWindow,
  WindowInfo,
} from "@miniben90/x-win";
import { GlobalKeyboardListener } from "node-global-key-listener";

import { AppsManager } from "../helpers/apps-manager";
import { MonitoredApp } from "../helpers/monitored-app";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { Logging } from "../utils/logging";
import { Wakatime } from "./wakatime";

export class Watcher {
  wakatime: Wakatime;
  activeWindow?: WindowInfo;
  private activeWindowSubscription: number | null;
  private gkl: GlobalKeyboardListener;
  private isWatchingForKeyboardEvents = false;

  constructor(wakatime: Wakatime) {
    this.wakatime = wakatime;
    this.activeWindowSubscription = null;
    this.gkl = new GlobalKeyboardListener();
  }

  private globalKeyListener: IGlobalKeyListener = (event) => {
    if (event.state !== "DOWN") {
      return;
    }

    try {
      // To ensure we always retrieve the most current window information, including the updated URL and title, we use the activeWindow function instead of relying on the previously stored this.activeApp. This approach addresses the issue where switching tabs in your browser does not trigger a window change event, leading to activeApp retaining outdated URL and title information.
      const window = activeWindow();
      const app = AppsManager.instance().getApp(window.info.path);
      if (!app) {
        return;
      }
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
      Logging.instance().log((error as Error).message);
    }
  };

  private watchKeyboardEvents() {
    this.isWatchingForKeyboardEvents = true;
    this.gkl.addListener(this.globalKeyListener);
  }

  private unwatchKeyboardEvents() {
    this.isWatchingForKeyboardEvents = false;
    this.gkl.removeListener(this.globalKeyListener);
  }

  start() {
    this.activeWindowSubscription = subscribeActiveWindow(
      (windowInfo: WindowInfo) => {
        if (this.isWatchingForKeyboardEvents) {
          this.unwatchKeyboardEvents();
        }

        Logging.instance().log(
          `App changed from ${this.activeWindow?.info.name || "nil"} to ${windowInfo.info.name || "nil"}`,
        );

        this.activeWindow = windowInfo;
        if (this.activeWindow.info.path) {
          const isMonitored = MonitoringManager.isMonitored(
            this.activeWindow.info.path,
          );

          if (isMonitored) {
            this.watchKeyboardEvents();
          }
        }
      },
    );
  }

  stop() {
    if (this.activeWindowSubscription !== null) {
      unsubscribeActiveWindow(this.activeWindowSubscription);
    }
  }
}
