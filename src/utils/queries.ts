import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "../../electron/helpers/settings-manager";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => window.ipcRenderer.settings.get(),
  });
};

export const useApps = () => {
  return useQuery({
    queryKey: ["apps"],
    queryFn: () => window.ipcRenderer.getInstalledApps(),
  });
};
export const useAppVersion = () => {
  return useQuery({
    queryKey: ["app-version"],
    queryFn: () => window.ipcRenderer.getAppVersion(),
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      queryClient.setQueryData<Settings>(["settings"], (oldSettings) => {
        return oldSettings ? { ...oldSettings, ...settings } : undefined;
      });
      window.ipcRenderer.settings.set(settings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};
