import { store } from "../store";

export class SettingsManager {
  static keys = {
    apiKey: "api_key",
    shouldLaunchOnLogIn: "launch_on_login",
    shouldLogToFile: "log_to_file",
  } as const;

  static getApiKey() {
    return store.get(this.keys.apiKey);
  }

  static setApiKey(apiKey: string) {
    store.set(this.keys.apiKey, apiKey);
  }

  static shouldLaunchOnLogIn(defaltValue = true) {
    const launchOnLogin = store.get(this.keys.shouldLaunchOnLogIn, defaltValue);
    console.log({ launchOnLogin });
    return launchOnLogin === true;
  }

  static setShouldLaunchOnLogIn(launchOnLogIn: boolean) {
    store.set(this.keys.shouldLaunchOnLogIn, launchOnLogIn);
  }

  static shouldLogToFile(defaltValue = true) {
    const launchOnLogin = store.get(this.keys.shouldLogToFile, defaltValue);
    console.log({ launchOnLogin });
    return launchOnLogin === true;
  }

  static setShouldLogToFile(logToFile: boolean) {
    store.set(this.keys.shouldLogToFile, logToFile);
  }
}
