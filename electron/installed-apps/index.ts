import { getInstalledApps as getInstalledAppsWindows } from "./windows";
import { getInstalledApps as getInstalledAppsMac } from "./mac";

export async function getInstalledApps(): Promise<Record<string, string>[]> {
  if (process.platform === "win32") {
    return getInstalledAppsWindows();
  }
  if (process.platform === "darwin") {
    return getInstalledAppsMac();
  }

  return [];
}
