import type { AppData } from "../helpers/apps-manager";
import { AppsManager } from "../helpers/apps-manager";
import { ConfigFile } from "../helpers/config-file";
import { Logger } from "../helpers/logger";

export class Wakatime {
  private logger: Logger;
  private configFile: ConfigFile;

  constructor(logger: Logger, configFile: ConfigFile) {
    this.logger = logger;
    this.configFile = configFile;
  }

  private shouldSendHeartbeat(app: AppData) {
    const isMonitored = AppsManager.isMonitoredApp(app);
    if (!isMonitored) {
      return false;
    }
    return true;
  }

  async sendHeartbeat(
    app: AppData,
    _windowInfo?: {
      title?: string;
      url?: string;
      processId?: number;
    },
  ) {
    if (!this.shouldSendHeartbeat(app)) {
      return;
    }
    console.log("Send Heartbeat: " + app.name);
  }
}
