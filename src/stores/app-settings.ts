import { create } from "zustand";
import { AppSettings, initAppSettings } from "../validators/app-settings";
import { AppInfo } from "~/types/app-data";

type AppSettingsState = {
  appSettings: AppSettings;
  setAppSettings: (settings: AppSettings) => void;
  monitorApp: (app: AppInfo, monitor: boolean) => void;
};

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  appSettings: initAppSettings,
  setAppSettings: (appSettings) => {
    window.ipcRenderer.settings.set(appSettings);
    set({ appSettings });
  },
  monitorApp: (app, value) => {
    const appSettings = { ...get().appSettings };

    if (
      value &&
      (!appSettings.monitoredApps ||
        !appSettings.monitoredApps.includes(app.path))
    ) {
      appSettings.monitoredApps = [
        ...(appSettings.monitoredApps ?? []),
        app.path,
      ];
    } else if (
      !value &&
      appSettings.monitoredApps &&
      appSettings.monitoredApps.includes(app.path)
    ) {
      appSettings.monitoredApps = appSettings.monitoredApps.filter(
        (item) => item !== app.path,
      );
    }
    window.ipcRenderer.settings.set(appSettings);
    set({ appSettings });
  },
}));
