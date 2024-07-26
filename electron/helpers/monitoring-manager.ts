export abstract class MonitoringManager {
  static isMonitored(path: string) {
    return false;
  }
  static set(path: string, monitor: boolean) {}
}
