import type { AppData } from "../helpers/apps-manager";
import { MonitoringManager } from "../helpers/monitoring-manager";
import { Logging } from "../utils/logging";

export class Wakatime {
  private shouldSendHeartbeat(app: AppData) {
    const isMonitored = MonitoringManager.isMonitored(app.path);
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
    Logging.instance().log(`Send Heartbeat: ${app.name}`);
  }
}
