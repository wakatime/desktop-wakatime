import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

import { DeepLink } from "./constants";

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

export function getArch() {
  return process.arch.indexOf("arm") !== -1
    ? "arm64"
    : process.arch.indexOf("64")
      ? "amd64"
      : process.arch.indexOf("32")
        ? "386"
        : process.arch;
}

export function getPlatfrom() {
  return process.platform === "win32" ? "windows" : process.platform;
}

export function getCLIPath() {
  const ext = process.platform === "win32" ? ".exe" : "";
  return path.join(
    getResourcesFolderPath(),
    `wakatime-cli-${getPlatfrom()}-${getArch()}${ext}`,
  );
}

export function getDeepLinkUrl(link: DeepLink) {
  return `wakatime://${link}`;
}
