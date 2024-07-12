import { create } from "zustand";
import { AppInfo } from "../types/app-data";

interface IntalledAppsState {
  apps: AppInfo[];
  setApps: (apps: AppInfo[]) => void;
}

export const useInstalledApps = create<IntalledAppsState>((set) => ({
  apps: [],
  setApps: (apps) => set({ apps }),
}));
