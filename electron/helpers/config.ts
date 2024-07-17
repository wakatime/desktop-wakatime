import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

export class Config {
  static getResourcesPath() {
    const userHome = app.getPath("home");
    const resourcesPath = path.join(userHome, ".wakatime-test");

    if (!fs.existsSync(resourcesPath)) {
      try {
        fs.mkdirSync(resourcesPath, { recursive: true });
      } catch (error) {
        console.error(error);
      }
    }

    return resourcesPath;
  }

  static getSettingsFilePath() {
    return path.join(this.getResourcesPath(), "wakatime-settings.json");
  }
}
