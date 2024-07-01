import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useAppSettings } from "../stores/app-settings";
import { AppSettings } from "../validators/app-settings";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";

export function Component() {
  const { appSettings, setAppSettings } = useAppSettings();
  const [version, setVersion] = useState("");

  const debouncedSetAppSettings = useDebounceCallback(
    (setSettings: AppSettings) => {
      setAppSettings(setSettings);
    },
    200,
  );

  useEffect(() => {
    setVersion(window.ipcRenderer.getAppVersion());
    window.document.title = "Settings";
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4">
      <div>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="wakatime-api-key">Wakatime API Key:</Label>
          <Input
            id="wakatime-api-key"
            defaultValue={appSettings.apiKey ?? ""}
            onChange={(e) =>
              debouncedSetAppSettings({
                ...appSettings,
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
            checked={appSettings.launchAtLogin === true}
            onCheckedChange={(checked) => {
              setAppSettings({
                ...appSettings,
                launchAtLogin: checked === true,
              });
            }}
            className="mt-1"
          />
          <Label htmlFor="launch-at-login" className="my-0.5 leading-5">
            Launch at login
          </Label>
        </fieldset>
        <fieldset className="flex gap-2">
          <Checkbox
            id="enable-logging"
            checked={appSettings.enableLogging === true}
            onCheckedChange={(checked) => {
              setAppSettings({
                ...appSettings,
                enableLogging: checked === true,
              });
            }}
            className="mt-1"
          />
          <Label htmlFor="enable-logging" className="my-0.5 leading-5">
            Enable logging to{" "}
            <code>C://ProgramData/wakatime/desktop-wakatime.log</code>
          </Label>
        </fieldset>
      </div>
      <div className="flex-1"></div>
      <div>
        <p className="text-muted-foreground text-sm">Version: {version}</p>
      </div>
    </div>
  );
}
