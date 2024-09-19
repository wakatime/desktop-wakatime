import { AppData } from "../../utils/validators";
import { getInstalledApps as getInstalledAppsMac } from "./mac";
import { getInstalledApps as getInstalledAppsWindows } from "./windows";

export async function getApps(): Promise<AppData[]> {
  let apps: AppData[] = [];

  if (process.platform === "win32") {
    apps = await getInstalledAppsWindows();
  } else if (process.platform === "darwin") {
    apps = await getInstalledAppsMac();
  }

  return apps;
}
