import { SettingsManager } from "./settings-manager";

export abstract class MonitoringManager {
  static set(path: string, monitor: boolean) {
    const monitoredApps = SettingsManager.get().monitoredApps;

    if (monitor && !monitoredApps.includes(path)) {
      SettingsManager.set({ monitoredApps: [...monitoredApps, path] });
    }

    if (!monitor && monitoredApps.includes(path)) {
      SettingsManager.set({
        monitoredApps: monitoredApps.filter((p) => p !== path),
      });
    }
  }
}
