import { AppData } from "~/types/app-data";
import { getInstalledAppsMac } from "./mac";
import { getInstalledAppsWindows } from "./windows";

export async function getInstalledApps(): Promise<AppData[]> {
  if (process.platform === "darwin") {
    return getInstalledAppsMac();
  }
  if (process.platform === "win32") {
    return getInstalledAppsWindows();
  }
  return [];
}
