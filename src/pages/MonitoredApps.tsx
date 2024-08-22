import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, ImageIcon, Loader2, RefreshCcw } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { PLUGINS } from "~/utils/constants";
import { AppData } from "../../electron/utils/validators";

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
                <AppListItem app={app} />
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
                <AppListItem app={app} />
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

const AppListItem = ({ app }: { app: AppData }) => {
  const [isMonitored, setIsMonitored] = useState(() =>
    window.ipcRenderer?.isMonitored(app.path),
  );

  const pluginUrl = useMemo(() => {
    const plugin = PLUGINS.find((plugin) =>
      app.execName ? plugin.execNames.includes(app.execName) : false,
    );
    return plugin?.pluginUrl;
  }, [app.execName]);

  const onMonitoredChange = useCallback((monitor: boolean) => {
    setIsMonitored(monitor);
    window.ipcRenderer?.setMonitored(app.path, monitor);
  }, []);

  return (
    <div className="flex h-14 items-center gap-4 px-4">
      <Avatar className="h-8 w-8 rounded-none bg-transparent" title={app.path}>
        <AvatarImage src={app.icon ?? undefined} />
        <AvatarFallback className="rounded-md text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <p className="flex-1 truncate">{app.name}</p>
      {pluginUrl ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.ipcRenderer?.shell.openExternal(pluginUrl);
          }}
        >
          Install Plugin
          <ExternalLink className="-mr-1 ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Switch checked={isMonitored} onCheckedChange={onMonitoredChange} />
      )}
    </div>
  );
};
