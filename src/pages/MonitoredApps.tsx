import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ImageIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { PLUGINS } from "~/utils/constants";
import { AppData } from "../../electron/utils/validators";

export function MonitoredAppsPage() {
  const appsQuery = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      return window.ipcRenderer?.getAllAvailableApps() ?? [];
    },
  });

  useEffect(() => {
    window.document.title = "Monitored Apps";
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {appsQuery.isPending ? (
        <AppsListSckeleton />
      ) : appsQuery.isError ? (
        <div className="p-4">
          <p className="text-muted-foreground">
            Error: {appsQuery.error.message}
          </p>
        </div>
      ) : appsQuery.data.length === 0 ? (
        <div className="p-4">
          <p className="text-muted-foreground">No apps</p>
          <Button
            onClick={() => appsQuery.refetch()}
            disabled={appsQuery.isRefetching}
          >
            Refresh
          </Button>
        </div>
      ) : (
        appsQuery.data.map((app, i) => {
          return (
            <Fragment key={app.path}>
              <AppListItem app={app} />
              {i < appsQuery.data.length - 1 && (
                <div className="pl-[4rem]">
                  <hr className="h-px bg-border" />
                </div>
              )}
            </Fragment>
          );
        })
      )}
    </div>
  );
}

const AppListItem = ({ app }: { app: AppData }) => {
  const queryClient = useQueryClient();
  const [isMonitored, setIsMonitored] = useState(false);

  const plugin = useMemo(
    () =>
      PLUGINS.find((item) =>
        app.execName
          ? item.execNames.includes(app.execName)
          : app.bundleId
            ? item.bundleIds?.includes(app.bundleId)
            : false,
      ),
    [app.execName, app.bundleId],
  );

  const onMonitoredChange = useCallback(
    (monitor: boolean) => {
      setIsMonitored(monitor);
      window.ipcRenderer?.setMonitored(app, monitor);
      queryClient.invalidateQueries({
        queryKey: ["apps"],
      });
    },
    [app],
  );

  useEffect(() => {
    setIsMonitored(window.ipcRenderer?.isMonitored(app.path) ?? false);
  }, [app.path]);

  return (
    <div className="flex h-14 items-center gap-4 px-4">
      <Avatar className="h-8 w-8 rounded-none bg-transparent" title={app.path}>
        <AvatarImage src={app.icon ?? undefined} />
        <AvatarFallback className="rounded-md text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <p className="flex-1 truncate">{app.name}</p>
      {plugin ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.ipcRenderer?.shell.openExternal(plugin.url);
          }}
        >
          Install {plugin.type === "extension" ? "Extension" : "Plugin"}
          <ExternalLink className="-mr-1 ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Switch checked={isMonitored} onCheckedChange={onMonitoredChange} />
      )}
    </div>
  );
};

const AppsListSckeleton = ({ count = 20 }: { count?: number }) =>
  new Array(count).fill(0).map((_, i) => (
    <Fragment key={i}>
      <div className="flex h-14 items-center gap-4 px-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-32" />
        <div className="flex-1"></div>
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      {i < count - 1 && (
        <div className="pl-[4rem]">
          <hr className="h-px bg-border" />
        </div>
      )}
    </Fragment>
  ));
