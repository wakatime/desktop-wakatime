import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

import { WAKATIME_PROTOCALL } from "./constants";

export function getResourcesFolderPath() {
  const userHome = app.getPath("home");

  const resourcesFolder = path.join(userHome, ".wakatime");

  if (!fs.existsSync(resourcesFolder)) {
    fs.mkdirSync(resourcesFolder, { recursive: true });
  }

  return resourcesFolder;
}

export function getWakatimeAppDataFolderPath() {
  const wakatimeAppDataFolder = path.join(app.getPath("appData"), "WakaTime");
  if (!fs.existsSync(wakatimeAppDataFolder)) {
    fs.mkdirSync(wakatimeAppDataFolder, { recursive: true });
  }
  return wakatimeAppDataFolder;
}

export function getDesktopWakaTimeConfigFilePath() {
  return path.join(getWakatimeAppDataFolderPath(), "desktop-wakatime.cfg");
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

export function getDeepLinkUrl(link: string) {
  return `${WAKATIME_PROTOCALL}://${link}`;
}

export async function exec(...command: string[]) {
  if (command.length === 0) {
    return ["", "No command provided"];
  }
  const binary = command[0];
  const args = command.slice(1);

  try {
    const output = await new Promise<string>((resolve, reject) => {
      execFile(binary, args, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }

        resolve(stdout);
      });
    });

    return [output.trim(), ""];
  } catch (e) {
    return ["", String(e)];
  }
}

export function parseJSONObject(data: string): object | null {
  if (!data?.trim()) {
    return null;
  }
  try {
    const obj = JSON.parse(atob(data)) as unknown;
    if (typeof obj !== "object") {
      return null;
    }
    return obj;
  } catch (_error) {
    try {
      const obj = JSON.parse(data) as unknown;
      if (typeof obj !== "object") {
        return null;
      }
      return obj;
    } catch (_error) {
      /* empty */
    }
  }
  return null;
}
