import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

import { Logger } from "./logger";

export class ConfigFile {
  private logger: Logger;
  userHome: string;
  resourcesFolder: string;
  filePath: string;
  filePathInternal: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.userHome = app.getPath("home");
    this.resourcesFolder = path.join(this.userHome, ".wakatime-test");

    if (!fs.existsSync(this.resourcesFolder)) {
      try {
        fs.mkdirSync(this.resourcesFolder, { recursive: true });
      } catch (error) {
        console.error(error);
      }
    }
    this.filePath = path.join(app.getPath("home"), ".wakatime.cfg");
    this.filePathInternal = path.join(
      this.resourcesFolder,
      "wakatime-internal.cfg",
    );
  }

  getSettings(section: string, key: string, internalConfig = false) {
    const file = internalConfig ? this.filePathInternal : this.filePath;
    let contents = "";
    try {
      contents = fs.readFileSync(file, { encoding: "utf-8" });
    } catch (error) {
      this.logger.error(`Failed reading URL: ${file}. Error: ${error}`);
      return null;
    }

    const lines = contents.split("\n");
    let currentSection = "";
    for (const line of lines) {
      if (line.startsWith("[") && line.endsWith("]")) {
        currentSection = line.slice(1, line.length - 1);
      } else if (currentSection === section) {
        const parts = line.split("=", 2);
        if (parts.length === 2 && parts[0].trim() === key) {
          return parts[1].trim();
        }
      }
    }
    return null;
  }

  setSettings(
    section: string,
    key: string,
    value: string,
    internalConfig = false,
  ) {
    const file = internalConfig ? this.filePathInternal : this.filePath;
    let contents = "";

    try {
      contents = fs.readFileSync(file, { encoding: "utf-8" });
    } catch (error) {
      contents = "[" + section + "]\n" + key + " = " + value;
      try {
        fs.writeFileSync(file, contents, { encoding: "utf-8" });
      } catch (error) {
        throw new Error(`Failed writing to URL: ${file}, Error: ${error}`);
      }
    }
    const lines = contents.split("\n");
    let output: string[] = [];
    let currentSection = "";
    let found = false;
    for (const line of lines) {
      if (line.startsWith("[") && line.endsWith("]")) {
        if (currentSection === section && !found) {
          output.push(key + " = " + value);
          found = true;
        }
        output.push(line);
        currentSection = line.slice(1, line.length - 1);
      } else if (currentSection === section) {
        let parts = line.split("=", 2);
        if (parts.length === 2 && parts[0].trim() === key) {
          if (!found) {
            output.push(key + " = " + value);
            found = true;
          }
        } else {
          output.push(line);
        }
      }
    }

    if (!found) {
      if (currentSection !== section) {
        output.push("[" + section + "]");
      }
      output.push(key + " = " + value);
    }

    try {
      fs.writeFileSync(file, output.join("\n"), { encoding: "utf-8" });
    } catch (error) {
      throw new Error(`Failed writing to URL: ${file}, Error: ${error}`);
    }
  }
}
