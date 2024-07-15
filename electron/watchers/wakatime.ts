import { WindowInfo } from "@miniben90/x-win";

import { SettingsManager } from "../helpers/settings-manager";

export class Wakatime {
  private shouldSendHeartbeat(app: WindowInfo) {
    const isMonitored = SettingsManager.get().monitoredApps.includes(
      app.info.path,
    );
    if (!isMonitored) {
      return false;
    }
    return true;
  }

  sendHeartbeat(app: WindowInfo) {
    if (!this.shouldSendHeartbeat(app)) {
      return;
    }
    console.log("Send Heartbeat: " + app.info.name);
  }
}
