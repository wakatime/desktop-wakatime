import fs from "node:fs";

import { Logging } from "../utils/logging";

export abstract class ConfigFileReader {
  static get(file: string, section: string, key: string) {
    let contents = "";

    try {
      contents = fs.readFileSync(file, { encoding: "utf-8" });
    } catch (error) {
      Logging.instance().log(`Failed to read file: ${file}. Error: ${error}`);
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
          return parts[1].trim().replace(/\\n/g, "\n");
        }
      }
    }
    return null;
  }

  static set(file: string, section: string, key: string, value: string) {
    value = value.replace(/\n/g, "\\n");
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
    const lines = contents ? contents.split("\n") : [];
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
      } else {
        output.push(line);
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

  static setBool(file: string, section: string, key: string, value: boolean) {
    this.set(file, section, key, value ? "True" : "False");
  }

  static getBool(file: string, section: string, key: string) {
    const value = this.get(file, section, key);
    return value === "True" ? true : value === "False" ? false : null;
  }
}
