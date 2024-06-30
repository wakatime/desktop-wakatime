import { app } from "electron";
import { AppSettings, appSettingsSchema } from "../src/validators/app-settings";
import path from "node:path";
import fs from "node:fs";

export function getAppSettingsFilePath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "wakatime-settings.json");
}

export function getAppSettings(): AppSettings {
  const settingsPath = getAppSettingsFilePath();
  try {
    const data = fs.readFileSync(settingsPath, { encoding: "utf-8" });
    return appSettingsSchema.parse(JSON.parse(data));
  } catch (error) {
    console.error("Error while getting settings", error);
    return {
      apiKey: null,
      launchAtLogin: true,
    };
  }
}

export function setAppSettings(settings: AppSettings) {
  const settingsPath = getAppSettingsFilePath();
  try {
    const verifiedAppSettings = appSettingsSchema.parse(settings);
    fs.writeFileSync(settingsPath, JSON.stringify(verifiedAppSettings));
  } catch (error) {
    console.error("Error while updating settings", error);
  }
}
