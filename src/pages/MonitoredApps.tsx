import { Fragment, useCallback, useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import type { AppData } from "../../electron/helpers/apps-manager";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Switch } from "~/components/ui/switch";

export function Component() {
  const [apps, setApps] = useState<AppData[]>([]);

  useEffect(() => {
    window.document.title = "Monitored Apps";
    const apps = window.ipcRenderer.getInstalledApps();
    setApps(apps);
  }, []);

  return (
    <div className="flex flex-col">
      {apps.map((app, i) => {
        return (
          <Fragment key={app.path}>
            <AppListItem app={app} />
            {i < apps.length - 1 && (
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

const AppListItem = ({ app }: { app: AppData }) => {
  const [isMonitored, setIsMonitored] = useState(false);

  const onMonitoredChange = useCallback((monitor: boolean) => {
    setIsMonitored(monitor);
  }, []);

  useEffect(() => {
    setIsMonitored(false);
  }, []);

  return (
    <div className="flex h-14 items-center gap-4 px-4">
      <Avatar className="h-8 w-8 rounded-none bg-transparent">
        <AvatarImage src={app.icon ?? undefined} />
        <AvatarFallback className="rounded-md text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <p className="flex-1 truncate">{app.name}</p>
      <Switch checked={isMonitored} onCheckedChange={onMonitoredChange} />
    </div>
  );
};
