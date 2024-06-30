import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useAppSettings } from "../stores/app-settings";
import { AppSettings } from "../validators/app-settings";

export default function SettingsPage() {
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
    <div className="flex min-h-screen flex-col space-y-6 bg-white p-4 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      <div>
        <fieldset className="flex flex-col gap-1">
          <label htmlFor="wakatime-api-key" className="text-sm font-medium">
            Wakatime API Key:
          </label>
          <input
            id="wakatime-api-key"
            defaultValue={appSettings.apiKey ?? ""}
            onChange={(e) =>
              debouncedSetAppSettings({
                ...appSettings,
                apiKey: e.target.value || null,
              })
            }
            className="h-8 rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-zinc-700"
          />
        </fieldset>
      </div>
      <div className="space-y-2">
        <fieldset className="flex items-start gap-2">
          <input
            type="checkbox"
            id="launch-at-login"
            checked={appSettings.launchAtLogin === true}
            onChange={(e) => {
              setAppSettings({
                ...appSettings,
                launchAtLogin: e.target.checked,
              });
            }}
            className="mt-1"
          />
          <label htmlFor="launch-at-login" className="text-sm font-medium">
            Launch at login
          </label>
        </fieldset>
        <fieldset className="flex items-start gap-2">
          <input
            type="checkbox"
            id="enable-logging"
            checked={appSettings.enableLogging === true}
            onChange={(e) => {
              setAppSettings({
                ...appSettings,
                enableLogging: e.target.checked,
              });
            }}
            className="mt-1"
          />
          <label htmlFor="enable-logging" className="text-sm font-medium">
            Enable logging to{" "}
            <code>C://ProgramData/wakatime/desktop-wakatime.log</code>
          </label>
        </fieldset>
      </div>
      <div className="flex-1"></div>
      <div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Version: {version}
        </p>
      </div>
    </div>
  );
}
