import { create } from "zustand";
import { AppData } from "../types/app-data";

interface IntalledAppsState {
  apps: AppData[];
  setApps: (apps: AppData[]) => void;
}

export const useInstalledApps = create<IntalledAppsState>((set) => ({
  apps: [],
  setApps: (apps) => set({ apps }),
}));
