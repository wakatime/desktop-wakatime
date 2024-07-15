import { store } from "../../store";
import { getInstalledApps as getInstalledAppsMac } from "./mac";
import { getInstalledApps as getInstalledAppsWindows } from "./windows";

export async function getInstalledApps(): Promise<Record<string, string>[]> {
  const cachedApps = store.get("installed-apps");
  if (cachedApps) {
    console.log("Cache Hit");
    return cachedApps as Record<string, string>[];
  }
  console.log("Cache Miss");

  let apps: Record<string, string>[] = [];

  if (process.platform === "win32") {
    apps = await getInstalledAppsWindows();
  } else if (process.platform === "darwin") {
    apps = await getInstalledAppsMac();
  }

  store.set("installed-apps", apps);

  return apps;
}
