import { useQuery } from "@tanstack/react-query";

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
