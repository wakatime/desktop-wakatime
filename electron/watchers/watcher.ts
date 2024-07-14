import { WindowInfo } from "@miniben90/x-win";
import { getAppSettings } from "../settings";

export class Watcher {
  activeApp: WindowInfo | null = null;

  appChanged(app: WindowInfo) {
    if (app.info.path === this.activeApp?.info.path) {
      return;
    }

    console.log(
      `App changed from ${this.activeApp?.info.name ?? "nil"} to ${app.info.name}`,
    );
    if (this.activeApp) {
      this.unwatch(this.activeApp);
    }

    this.activeApp = app;

    const appSettings = getAppSettings();
    const isMonitored =
      appSettings.monitoredApps &&
      appSettings.monitoredApps.includes(app.info.path);

    if (isMonitored) {
      this.watch(app);
    }
  }

  watch(app: WindowInfo) {
    console.log(`Watch ${app.info.name}`);
  }

  unwatch(app: WindowInfo) {
    console.log(`Unwatch ${app.info.name}`);
  }
}
