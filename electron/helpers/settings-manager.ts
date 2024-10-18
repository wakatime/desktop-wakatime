import { app } from "electron";
import isDev from "electron-is-dev";

import { Logging, LogLevel } from "../utils/logging";
import { PropertiesManager } from "./properties-manager";

export abstract class SettingsManager {
  static logInItemRegistered() {
    const { openAtLogin } = app.getLoginItemSettings();
    return openAtLogin;
  }

  static shouldRegisterAsLogInItem() {
    const registered = this.logInItemRegistered();
    if (PropertiesManager.shouldLaunchOnLogin && !registered) {
      return app.isPackaged;
    }
    return false;
  }

  static registerAsLogInItem() {
    PropertiesManager.shouldLaunchOnLogin = true;
    if (isDev) {
      return;
    }
    try {
      app.setLoginItemSettings({ openAtLogin: true });
      Logging.instance().log("Registered as login item");
    } catch (error) {
      Logging.instance().log(
        `Failed to register as login item. Error: ${error}`,
        LogLevel.ERROR,
      );
    }
  }

  static unregisterAsLogInItem() {
    PropertiesManager.shouldLaunchOnLogin = false;
    if (isDev) {
      return;
    }
    try {
      app.setLoginItemSettings({ openAtLogin: false });
      Logging.instance().log("Unregistered as login item");
    } catch (error) {
      Logging.instance().log(
        `Failed to unregister as login item. Error: ${error}`,
        LogLevel.ERROR,
      );
    }
  }
}
