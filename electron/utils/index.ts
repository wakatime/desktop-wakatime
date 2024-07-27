import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

export function getResourcesFolderPath() {
  const userHome = app.getPath("home");

  const resourcesFolder = path.join(
    userHome,
    app.isPackaged ? ".wakatime" : ".wakatime-test",
  );

  if (!fs.existsSync(resourcesFolder)) {
    fs.mkdirSync(resourcesFolder, { recursive: true });
  }

  return resourcesFolder;
}

export function getDesktopWakaTimeConfigFilePath() {
  const folder = path.join(app.getPath("appData"), "WakaTime");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return path.join(folder, "desktop-wakatime.cfg");
}

export function getLogFilePath() {
  return path.join(
    getResourcesFolderPath(),
    `${process.platform}-wakatime.log`,
  );
}
