import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { z } from "zod";

export const settingsSchema = z.object({
  apiKey: z.string().nullable().default(null),
  monitoredApps: z.array(z.string()).default([]),
  launchAtLogIn: z.boolean().default(true),
  enableLogging: z.boolean().default(false),
});

export type Settings = z.infer<typeof settingsSchema>;

export const initSettings: Settings = settingsSchema.parse({});

export abstract class SettingsManager {
  static getFilePath() {
    const userDataPath = app.getPath("userData");
    return path.join(userDataPath, "wakatime-settings.json");
  }

  static get(): Settings {
    const filePath = this.getFilePath();
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    const settings = settingsSchema.parse(JSON.parse(data));
    return settings;
  }

  static set(data: Partial<Settings>) {
    const validData = settingsSchema.partial().parse(data);
    const settings = SettingsManager.get();
    const newSettings: Settings = {
      ...settings,
      ...validData,
    };
    const filePath = this.getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(newSettings));
    return newSettings;
  }

  static reset() {
    return this.set(settingsSchema.parse({}));
  }
}
