import { getInstalledApps as getInstalledAppsWindows } from "./windows";

export async function getInstalledApps(): Promise<Record<string, string>[]> {
  if (process.platform === "win32") {
    return getInstalledAppsWindows();
  }

  return [];
}
