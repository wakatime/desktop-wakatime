import fs from "node:fs";
import path from "node:path";

import "node:fs/promises";

import { format } from "date-fns";

import { getResourcesFolderPath } from ".";

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR,
}

export class Logging {
  static _instacneCache?: Logging;
  level = LogLevel.DEBUG;
  filePath: string | null = null;

  static instance(): Logging {
    if (!this._instacneCache) {
      this._instacneCache = new this();
    }
    return this._instacneCache;
  }

  configure(filePath?: string | null, level?: LogLevel) {
    if (filePath !== undefined) {
      this.filePath = filePath;
    }
    if (level !== undefined) {
      this.level = level;
    }
  }

  activateLoggingToFile() {
    const logFilePath = path.join(
      getResourcesFolderPath(),
      `${process.platform}-wakatime.log`,
    );
    this.configure(logFilePath);
  }

  deactivateLoggingToFile() {
    this.filePath = null;
  }

  public log(msg: string, level = LogLevel.DEBUG) {
    if (level < this.level) {
      return;
    }

    msg = `[WakaTime][${LogLevel[level]}] ${msg}`;
    if (level == LogLevel.DEBUG) console.log(msg);
    if (level == LogLevel.INFO) console.info(msg);
    if (level == LogLevel.WARN) console.warn(msg);
    if (level == LogLevel.ERROR) console.error(msg);

    if (this.filePath) {
      const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
      const logMessage = `${timestamp}: ${msg}`;

      if (fs.existsSync(this.filePath)) {
        fs.appendFileSync(this.filePath, `\n${logMessage}`, {
          encoding: "utf-8",
        });
      } else {
        fs.writeFileSync(this.filePath, logMessage, { encoding: "utf-8" });
      }
    }
  }
}
