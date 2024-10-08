import path from "node:path";
import { app } from "electron";

import { getResourcesFolderPath } from "../utils";
import { ConfigFileReader } from "./config-file-reader";

export abstract class ConfigFile {
  static getConfigFilePath(internalConfig = false) {
    if (internalConfig) {
      return path.join(getResourcesFolderPath(), "wakatime-internal.cfg");
    } else {
      const userHome = app.getPath("home");
      return path.join(userHome, ".wakatime.cfg");
    }
  }

  static getSetting(section: string, key: string, internalConfig = false) {
    const file = this.getConfigFilePath(internalConfig);
    return ConfigFileReader.get(file, section, key);
  }

  static setSetting(
    section: string,
    key: string,
    value: string,
    internalConfig = false,
  ) {
    const file = this.getConfigFilePath(internalConfig);
    ConfigFileReader.set(file, section, key, value);
  }
}
