import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

import { Logging, LogLevel } from "./logging";

export function getResourcesFolderPath() {
  const userHome = app.getPath("home");

  const resourcesFolder = path.join(
    userHome,
    app.isPackaged ? ".wakatime" : ".wakatime-test",
  );

  if (!fs.existsSync(resourcesFolder)) {
    try {
      fs.mkdirSync(resourcesFolder, { recursive: true });
    } catch (error) {
      Logging.instance().log(
        `Failed to create folder: ${resourcesFolder}. Error: ${error}`,
        LogLevel.ERROR,
      );
    }
  }

  return resourcesFolder;
}
