import { getDesktopWakaTimeConfigFilePath } from "../utils";
import { AppData } from "../utils/validators";
import { AppsManager } from "./apps-manager";
import { ConfigFileReader } from "./config-file-reader";

export abstract class MonitoringManager {
  static isBrowserMonitored() {
    const browserApps = AppsManager.instance().installedApps.filter(
      (app) => app.isBrowser,
    );
    return browserApps.findIndex((app) => this.isMonitored(app.path)) !== -1;
  }

  static isMonitored(path: string) {
    const monitoringKey = this.monitoredKey(path);
    const file = getDesktopWakaTimeConfigFilePath();
    const monitoring = ConfigFileReader.getBool(
      file,
      "monitoring",
      monitoringKey,
    );
    if (monitoring === null) {
      ConfigFileReader.setBool(file, "monitoring", monitoringKey, false);
      return false;
    }
    return monitoring;
  }

  static set(app: AppData, monitor: boolean) {
    if (AppsManager.isExcludedApp(app)) {
      return;
    }
    if (!AppsManager.instance().getApp(app.path)) {
      AppsManager.instance().addExtraApp(app);
    }
    const monitoringKey = this.monitoredKey(app.path);
    const file = getDesktopWakaTimeConfigFilePath();
    ConfigFileReader.setBool(file, "monitoring", monitoringKey, monitor);
  }

  static monitoredKey(path: string) {
    return `is_${path}_monitored`;
  }
}
