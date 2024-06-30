import { create } from "zustand";
import { AppSettings, initAppSettings } from "../validators/app-settings";

type AppSettingsState = {
  appSettings: AppSettings;
  setAppSettings: (settings: AppSettings) => void;
};

export const useAppSettings = create<AppSettingsState>((set) => ({
  appSettings: initAppSettings,
  setAppSettings: (appSettings) => {
    window.ipcRenderer.settings.set(appSettings);
    set({ appSettings });
  },
}));
