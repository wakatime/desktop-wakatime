import { getInstalledApps as getInstalledAppsMac } from "./mac";
import { getInstalledApps as getInstalledAppsWindows } from "./windows";

export async function getInstalledApps(): Promise<Record<string, string>[]> {
  let apps: Record<string, string>[] = [];

  if (process.platform === "win32") {
    apps = await getInstalledAppsWindows();
  } else if (process.platform === "darwin") {
    apps = await getInstalledAppsMac();
  }

  return apps;
}
