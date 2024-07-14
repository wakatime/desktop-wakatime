import { store } from "../store";

export class MonitoringManager {
  static isAppMonitored(path: string) {
    const key = this.monitoredKey(path);
    const isMonitored = store.get(key, false);
    console.log(path, isMonitored);
    return isMonitored === true;
  }

  static set(path: string, monitor: boolean) {
    const key = this.monitoredKey(path);
    store.set(key, monitor);
    // TODO: Update all listeners
  }

  static enabledByDefault(path: string) {
    console.log(path);
  }

  static monitoredKey(path: string) {
    return `is_${path}_monitored`;
  }
}
