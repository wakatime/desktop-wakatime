import { app } from "electron";
import {
  type AppSettings,
  appSettingsSchema,
} from "../../src/validators/app-settings";
import path from "node:path";
import fs from "node:fs";

export function getAppSettingsFilePath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "wakatime-settings.json");
}

export const initialAppSettings: AppSettings = {
  apiKey: null,
  launchAtLogin: true,
  monitoredApps: [],
  enableLogging: true,
};

export function getAppSettings(): AppSettings {
  try {
    const settingsPath = getAppSettingsFilePath();
    const data = fs.readFileSync(settingsPath, { encoding: "utf-8" });
    return appSettingsSchema.parse(JSON.parse(data));
  } catch (error) {
    console.error("Error while getting settings", error);
    return initialAppSettings;
  }
}

export function setAppSettings(settings: AppSettings) {
  try {
    const settingsPath = getAppSettingsFilePath();
    const verifiedAppSettings = appSettingsSchema.parse(settings);
    fs.writeFileSync(settingsPath, JSON.stringify(verifiedAppSettings));
  } catch (error) {
    console.error("Error while updating settings", error);
  }
}
