import { useCallback, useEffect, useMemo } from "react";
import { ImageIcon, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Switch } from "~/components/ui/switch";
import { AppData } from "~/types/app-info";
import { useApps, useSettings, useSettingsMutation } from "~/utils/queries";

export function Component() {
  const settingsQuery = useSettings();
  const appsQuery = useApps();
  const setSettingsMut = useSettingsMutation();

  const monitoredApps = useMemo(
    () => settingsQuery.data?.monitoredApps ?? [],
    [settingsQuery.data?.monitoredApps],
  );

  const onMonitorAppChange = useCallback(
    (app: AppData, monitor: boolean) => {
      if (monitor && !monitoredApps.includes(app.path)) {
        setSettingsMut.mutate({ monitoredApps: [...monitoredApps, app.path] });
      }

      if (!monitor && monitoredApps.includes(app.path)) {
        setSettingsMut.mutate({
          monitoredApps: monitoredApps.filter((item) => item !== app.path),
        });
      }
    },
    [monitoredApps, setSettingsMut],
  );

  useEffect(() => {
    window.document.title = "Monitored Apps";
  }, []);

  if (appsQuery.isPending || settingsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (appsQuery.isError) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>{appsQuery.error.message}</p>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>{settingsQuery.error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {appsQuery.data.map((app, i) => {
        return (
          <div key={app.path}>
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
            {i < appsQuery.data.length - 1 && (
              <div className="pl-[4rem]">
                <hr className="h-px bg-border" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
