import {
  subscribeActiveWindow,
  unsubscribeActiveWindow,
  WindowInfo,
} from "@miniben90/x-win";
import { getAppSettings } from "../helpers/settings";

import {
  GlobalKeyboardListener,
  type IGlobalKeyListener,
} from "node-global-key-listener";
import { AppData } from "~/types/app-info";

export class Watcher {
  activeApp: AppData | null;
  private activeWindowSubscription: number | null;
  private gkl: GlobalKeyboardListener;

  constructor() {
    this.activeApp = null;
    this.activeWindowSubscription = null;
    this.gkl = new GlobalKeyboardListener();
  }

  private globalKeyListener: IGlobalKeyListener = (event) => {
    if (event.state === "DOWN") {
      console.log(this.activeApp?.name, event.rawKey);
    }
  };

  private watch(app: AppData) {
    console.log(`Watch ${app.name}`);
    this.gkl.addListener(this.globalKeyListener);
  }

  private unwatch(app: AppData) {
    console.log(`Unwatch ${app.name}`);
    this.gkl.removeListener(this.globalKeyListener);
  }

  start() {
    this.activeWindowSubscription = subscribeActiveWindow(
      (windowInfo: WindowInfo) => {
        if (windowInfo.info.path === this.activeApp?.path) {
          return;
        }

        console.log(
          `App changed from ${this.activeApp?.name ?? "nil"} to ${windowInfo.info.name}`,
        );
        if (this.activeApp) {
          this.unwatch(this.activeApp);
        }

        this.activeApp = {
          name: windowInfo.info.name,
          path: windowInfo.info.path,
        };

        const appSettings = getAppSettings();
        const isMonitored =
          appSettings.monitoredApps &&
          appSettings.monitoredApps.includes(this.activeApp.path);

        if (isMonitored) {
          this.watch(this.activeApp);
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

export const watcher = new Watcher();
