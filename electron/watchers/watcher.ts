import type { IGlobalKeyListener } from "node-global-key-listener";
import {
  activeWindow,
  subscribeActiveWindow,
  unsubscribeActiveWindow,
  WindowInfo,
} from "@miniben90/x-win";
import { GlobalKeyboardListener } from "node-global-key-listener";

import { SettingsManager } from "../helpers/settings-manager";

export class Watcher {
  activeWindow: WindowInfo;
  private activeWindowSubscription: number | null;
  private gkl: GlobalKeyboardListener;
  private isWatchingForKeyboardEvents = false;

  constructor() {
    this.activeWindow = activeWindow();
    this.activeWindowSubscription = null;
    this.gkl = new GlobalKeyboardListener();
  }

  private globalKeyListener: IGlobalKeyListener = (event) => {
    if (event.state !== "DOWN") {
      return;
    }

    // To ensure we always retrieve the most current window information, including the updated URL and title, we use the activeWindow function instead of relying on the previously stored this.activeApp. This approach addresses the issue where switching tabs in your browser does not trigger a window change event, leading to activeApp retaining outdated URL and title information.
    try {
      const window = activeWindow();

      console.log({
        name: window.info.name,
        title: window.title,
        url: window.url,
        key: event.rawKey?.name,
      });
    } catch (error) {
      console.error(error);
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

        this.activeWindow = windowInfo;

        const monitoredApps = SettingsManager.get().monitoredApps;
        const isMonitored = monitoredApps.includes(this.activeWindow.info.path);

        if (isMonitored) {
          this.watchKeyboardEvents();
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
