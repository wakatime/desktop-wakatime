import { Fragment, useCallback, useLayoutEffect, useMemo } from "react";
import { Switch } from "~/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ImageIcon, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppSettings } from "~/validators/app-settings";
import { AppInfo } from "~/types/app-info";

export function Component() {
  const utils = useQueryClient();
  const appSettingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => window.ipcRenderer.settings.get(),
  });
  const installedAppsQuery = useQuery({
    queryKey: ["installed-apps"],
    queryFn: () => window.ipcRenderer.getInstalledApps(),
  });
  const setAppSettingsMut = useMutation({
    mutationFn: async (appSettings: AppSettings) => {
      utils.setQueryData(["app-settings"], appSettings);
      await window.ipcRenderer.settings.set(appSettings);
    },
    onSettled: () => {
      utils.invalidateQueries({
        queryKey: ["app-settings"],
      });
    },
  });

  const monitoredApps = useMemo(
    () => appSettingsQuery.data?.monitoredApps ?? [],
    [appSettingsQuery.data?.monitoredApps],
  );

  const onMonitorAppChange = useCallback(
    (app: AppInfo, monitor: boolean) => {
      if (!appSettingsQuery.isSuccess) {
        return;
      }
      let monitoredApps = appSettingsQuery.data.monitoredApps ?? [];
      if (monitor && (!monitoredApps || !monitoredApps.includes(app.path))) {
        monitoredApps = [...monitoredApps, app.path];
      } else if (
        !monitor &&
        monitoredApps &&
        monitoredApps.includes(app.path)
      ) {
        monitoredApps = monitoredApps.filter((item) => item !== app.path);
      }
      setAppSettingsMut.mutate({
        ...appSettingsQuery.data,
        monitoredApps,
      });
    },
    [appSettingsQuery.data, appSettingsQuery.isSuccess, setAppSettingsMut],
  );

  useLayoutEffect(() => {
    window.document.title = "Monitored Apps";
  }, []);

  if (installedAppsQuery.isPending || appSettingsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (installedAppsQuery.isError) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>{installedAppsQuery.error.message}</p>
      </div>
    );
  }

  if (appSettingsQuery.isError) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>{appSettingsQuery.error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {installedAppsQuery.data.map((app, i) => {
        return (
          <Fragment key={app.path}>
            <div className="flex h-14 items-center gap-4 px-4">
              <Avatar className="h-8 w-8 rounded-none bg-transparent">
                <AvatarImage src={app.icon ?? undefined} />
                <AvatarFallback className="rounded-md text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <p className="flex-1 truncate">{app.name}</p>
              <Switch
                checked={monitoredApps.includes(app.path)}
                onCheckedChange={(value) => {
                  onMonitorAppChange(app, value);
                }}
              />
            </div>
            {i < installedAppsQuery.data.length - 1 && (
              <div className="pl-[4rem]">
                <hr className="h-px bg-border" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
