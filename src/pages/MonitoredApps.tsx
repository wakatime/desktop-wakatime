import { Fragment, useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, RefreshCcw } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";

export function MonitoredAppsPage() {
  const installedAppsQuery = useQuery({
    queryKey: ["installed-apps"],
    queryFn: async () => {
      return window.ipcRenderer?.getInstalledApps() ?? [];
    },
  });
  const openWindowsQuery = useQuery({
    queryKey: ["open-windows"],
    queryFn: async () => {
      const openWindows = await window.ipcRenderer?.getOpenWindows();
      return openWindows ?? [];
    },
  });

  useEffect(() => {
    window.document.title = "Monitored Apps";
  }, []);

  return (
    <div className="flex flex-col">
      <section id="installed-apps">
        <div className="sticky top-0 z-20 flex h-12 items-center border-b bg-background px-4">
          <p className="flex-1 truncate font-medium text-muted-foreground">
            Installed Apps
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-muted-foreground"
            title="Refresh"
            disabled={installedAppsQuery.isRefetching}
            onClick={() => installedAppsQuery.refetch()}
          >
            {installedAppsQuery.isRefetching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCcw className="h-5 w-5" />
            )}
            <div className="sr-only">Refresh</div>
          </Button>
        </div>

        {installedAppsQuery.isPending ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : installedAppsQuery.isError ? (
          <div className="p-4">
            <p className="text-muted-foreground">
              Error: {installedAppsQuery.error.message}
            </p>
          </div>
        ) : installedAppsQuery.data.length === 0 ? (
          <div className="p-4">
            <p className="text-muted-foreground">No open windows</p>
          </div>
        ) : (
          installedAppsQuery.data.map((app, i) => {
            return (
              <Fragment key={app.path}>
                <AppListItem title={app.name} icon={app.icon} path={app.path} />
                {i < installedAppsQuery.data.length - 1 && (
                  <div className="pl-[4rem]">
                    <hr className="h-px bg-border" />
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </section>

      <section id="open-windows">
        <div className="sticky top-0 z-20 flex h-12 items-center border-b bg-background px-4">
          <p className="flex-1 truncate font-medium text-muted-foreground">
            Open Windows
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-muted-foreground"
            title="Refresh"
            disabled={openWindowsQuery.isRefetching}
            onClick={() => openWindowsQuery.refetch()}
          >
            {openWindowsQuery.isRefetching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCcw className="h-5 w-5" />
            )}
            <div className="sr-only">Refresh</div>
          </Button>
        </div>
        {openWindowsQuery.isPending ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : openWindowsQuery.isError ? (
          <div className="p-4">
            <p className="text-muted-foreground">
              Error: {openWindowsQuery.error.message}
            </p>
          </div>
        ) : openWindowsQuery.data.length === 0 ? (
          <div className="p-4">
            <p className="text-muted-foreground">No open windows</p>
          </div>
        ) : (
          openWindowsQuery.data.map((app, i) => {
            return (
              <Fragment key={app.path}>
                <AppListItem title={app.name} icon={app.icon} path={app.path} />
                {i < openWindowsQuery.data.length - 1 && (
                  <div className="pl-[4rem]">
                    <hr className="h-px bg-border" />
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </section>
    </div>
  );
}

const AppListItem = ({
  title,
  path,
  icon,
}: {
  title: string;
  path: string;
  icon?: string | null;
}) => {
  const [isMonitored, setIsMonitored] = useState(() =>
    window.ipcRenderer?.isMonitored(path),
  );

  const onMonitoredChange = useCallback((monitor: boolean) => {
    setIsMonitored(monitor);
    window.ipcRenderer?.setMonitored(path, monitor);
  }, []);

  return (
    <div className="flex h-14 items-center gap-4 px-4">
      <Avatar className="h-8 w-8 rounded-none bg-transparent" title={path}>
        <AvatarImage src={icon ?? undefined} />
        <AvatarFallback className="rounded-md text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <p className="flex-1 truncate">{title}</p>
      <Switch checked={isMonitored} onCheckedChange={onMonitoredChange} />
    </div>
  );
};
