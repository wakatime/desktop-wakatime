import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";

import type { Settings } from "../../electron/helpers/settings-manager";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  useAppVersion,
  useSettings,
  useSettingsMutation,
} from "~/utils/queries";

export function Component() {
  const settingsQuery = useSettings();
  const appVersionQuery = useAppVersion();
  const setSettingsMut = useSettingsMutation();

  const debouncedSetAppSettings = useDebounceCallback(
    (settings: Partial<Settings>) => {
      setSettingsMut.mutate(settings);
    },
    200,
  );

  useEffect(() => {
    window.document.title = "Settings";
  }, []);

  if (settingsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
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
    <div className="flex flex-1 flex-col space-y-6 p-4">
      <div>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="wakatime-api-key">Wakatime API Key:</Label>
          <Input
            id="wakatime-api-key"
            defaultValue={settingsQuery.data.apiKey ?? ""}
            onChange={(e) =>
              debouncedSetAppSettings({
                apiKey: e.target.value,
              })
            }
          />
        </fieldset>
      </div>
      <div className="space-y-2">
        <fieldset className="flex gap-2">
          <Checkbox
            id="launch-at-login"
            checked={settingsQuery.data.launchAtLogIn}
            onCheckedChange={(checked) => {
              setSettingsMut.mutate({
                launchAtLogIn: checked === true,
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
