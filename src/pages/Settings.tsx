import { useLayoutEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { AppSettings } from "../validators/app-settings";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function Component() {
  const utils = useQueryClient();
  const appSettingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => window.ipcRenderer.settings.get(),
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
  const appVersionQuery = useQuery({
    queryKey: ["app-version"],
    queryFn: () => window.ipcRenderer.getAppVersion(),
  });

  const debouncedSetAppSettings = useDebounceCallback(
    (setSettings: AppSettings) => {
      setAppSettingsMut.mutate(setSettings);
    },
    200,
  );

  useLayoutEffect(() => {
    window.document.title = "Settings";
  }, []);

  if (appSettingsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
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
    <div className="flex flex-1 flex-col space-y-6 p-4">
      <div>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="wakatime-api-key">Wakatime API Key:</Label>
          <Input
            id="wakatime-api-key"
            defaultValue={appSettingsQuery.data.apiKey ?? ""}
            onChange={(e) =>
              debouncedSetAppSettings({
                ...appSettingsQuery.data,
                apiKey: e.target.value || null,
              })
            }
          />
        </fieldset>
      </div>
      <div className="space-y-2">
        <fieldset className="flex gap-2">
          <Checkbox
            id="launch-at-login"
            checked={appSettingsQuery.data.launchAtLogin === true}
            onCheckedChange={(checked) => {
              setAppSettingsMut.mutate({
                ...appSettingsQuery.data,
                launchAtLogin: checked === true,
              });
            }}
            className="mt-1"
          />
          <Label htmlFor="launch-at-login" className="my-0.5 leading-5">
            Launch at login
          </Label>
        </fieldset>
        {/* <fieldset className="flex gap-2">
          <Checkbox
            id="enable-logging"
            checked={appSettingsQuery.data.enableLogging === true}
            onCheckedChange={(checked) => {
              setAppSettingsMut.mutate({
                ...appSettingsQuery.data,
                enableLogging: checked === true,
              });
            }}
            className="mt-1"
          />
          <Label htmlFor="enable-logging" className="my-0.5 leading-5">
            Enable logging to{" "}
            <code>C://ProgramData/wakatime/desktop-wakatime.log</code>
          </Label>
        </fieldset> */}
      </div>
      <div className="flex-1"></div>
      <div>
        <p className="text-sm text-muted-foreground">
          Version:{" "}
          {appVersionQuery.isPending
            ? "Loading..."
            : appVersionQuery.isError
              ? appVersionQuery.error.message
              : appVersionQuery.data}
        </p>
      </div>
    </div>
  );
}
