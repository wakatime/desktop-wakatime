import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import type {
  DomainPreferenceType,
  FilterType,
} from "../../electron/utils/constants";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { IpcKeys } from "../../electron/utils/constants";

export function SettingsPage() {
  const [apiKey, setApiKey] = useState(
    () => window.ipcRenderer?.getSetting("settings", "api_key") ?? "",
  );
  const [logFilePath] = useState(
    () => window.ipcRenderer?.sendSync(IpcKeys.logFilePath) as string,
  );
  const [shouldLogToFile, setShouldLogToFile] = useState(() =>
    window.ipcRenderer?.shouldLogToFile(),
  );
  const [shouldLaunchOnLogIn, setShouldLaunchOnLogIn] = useState(() =>
    window.ipcRenderer?.shouldLaunchOnLogIn(),
  );
  const [codeTimeInStatusBar, setCodeTimeInStatusBar] = useState(() =>
    window.ipcRenderer?.codeTimeInStatusBar(),
  );
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(() =>
    window.ipcRenderer?.autoUpdateEnabled(),
  );
  const [isBrowserMonitored] = useState(
    () => window.ipcRenderer?.sendSync(IpcKeys.isBrowserMonitored) as boolean,
  );
  const [domainPreference, setDomainPreference] = useState(
    () =>
      window.ipcRenderer?.sendSync(
        IpcKeys.getDomainPreference,
      ) as DomainPreferenceType,
  );
  const [filterType, setFilterType] = useState(
    () => window.ipcRenderer?.sendSync(IpcKeys.getFilterType) as FilterType,
  );
  const [denylist, setDenylist] = useState(
    () => window.ipcRenderer?.sendSync(IpcKeys.getDenylist) as string,
  );
  const [allowlist, setAllowlist] = useState(
    () => window.ipcRenderer?.sendSync(IpcKeys.getAllowlist) as string,
  );
  const [appVersion] = useState(() => window.ipcRenderer?.getAppVersion());
  const [platform] = useState(() => window.ipcRenderer?.getPlatform());

  const debouncedSetApiKey = useDebounceCallback((apiKey: string) => {
    window.ipcRenderer?.setSetting("settings", "api_key", apiKey);
    setApiKey(apiKey);
  }, 200);
  const debouncedSetDenylist = useDebounceCallback((value: string) => {
    window.ipcRenderer?.send(IpcKeys.setDenylist, value);
    setDenylist(value);
  }, 200);
  const debouncedSetAllowlist = useDebounceCallback((value: string) => {
    window.ipcRenderer?.send(IpcKeys.setAllowlist, value);
    setAllowlist(value);
  }, 200);

  const handleShouldLogToFileChange = useCallback((value: boolean) => {
    window.ipcRenderer?.setShouldLogToFile(value);
    setShouldLogToFile(value);
  }, []);

  const handleShouldLaunchOnLogInChange = useCallback((value: boolean) => {
    window.ipcRenderer?.setShouldLaunchOnLogIn(value);
    setShouldLaunchOnLogIn(value);
  }, []);

  const handleCodeTimeInStatusBarChange = useCallback((value: boolean) => {
    window.ipcRenderer?.setCodeTimeInStatusBar(value);
    setCodeTimeInStatusBar(value);
  }, []);

  const handleAutoUpdateEnabledChange = useCallback((value: boolean) => {
    window.ipcRenderer?.setAutoUpdateEnabled(value);
    setAutoUpdateEnabled(value);
  }, []);

  const handleDomainPreferenceChange = useCallback(
    (value: DomainPreferenceType) => {
      window.ipcRenderer?.send(IpcKeys.setDomainPreference, value);
      setDomainPreference(value);
    },
    [],
  );
  const handleFilterTypeChange = useCallback((value: FilterType) => {
    window.ipcRenderer?.send(IpcKeys.setFilterType, value);
    setFilterType(value);
  }, []);

  useEffect(() => {
    window.document.title = "Settings";
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4">
      <div>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="wakatime-api-key">Wakatime API Key:</Label>
          <Input
            id="wakatime-api-key"
            defaultValue={apiKey}
            onChange={(e) => {
              debouncedSetApiKey(e.target.value);
            }}
          />
        </fieldset>
      </div>
      <div className="space-y-2">
        <fieldset className="flex gap-2">
          <Checkbox
            id="launch-at-login"
            className="mt-1"
            checked={shouldLaunchOnLogIn}
            onCheckedChange={(checked) => {
              handleShouldLaunchOnLogInChange(checked === true);
            }}
          />
          <Label htmlFor="launch-at-login" className="my-0.5 leading-5">
            Launch at login
          </Label>
        </fieldset>

        <fieldset className="flex gap-2">
          <Checkbox
            id="code-time-in-status-bar"
            checked={codeTimeInStatusBar}
            onCheckedChange={(checked) => {
              handleCodeTimeInStatusBarChange(checked === true);
            }}
            className="mt-1"
          />
          <Label htmlFor="code-time-in-status-bar" className="my-0.5 leading-5">
            Show code time in{" "}
            {platform === "darwin" ? "status bar" : "system tray icon hover"}
          </Label>
        </fieldset>

        <fieldset className="flex gap-2">
          <Checkbox
            id="enable-logging"
            checked={shouldLogToFile}
            onCheckedChange={(checked) => {
              handleShouldLogToFileChange(checked === true);
            }}
            className="mt-1"
          />
          <Label htmlFor="enable-logging" className="my-0.5 leading-5">
            Enable logging to <code>{logFilePath}</code>
          </Label>
        </fieldset>

        <fieldset className="flex gap-2">
          <Checkbox
            id="auto-update-enabled"
            checked={autoUpdateEnabled}
            onCheckedChange={(checked) => {
              handleAutoUpdateEnabledChange(checked === true);
            }}
            className="mt-1"
          />
          <Label htmlFor="auto-update-enabled" className="my-0.5 leading-5">
            Install updates automatically
          </Label>
        </fieldset>
      </div>
      {isBrowserMonitored && (
        <div className="space-y-6">
          <p>
            The settings below are only applicable because you’ve enabled
            monitoring a browser in the Monitored Apps menu.
          </p>
          <div>
            <fieldset className="space-y-1">
              <Label>Browser Tracking:</Label>
              <Tabs value={domainPreference}>
                <TabsList>
                  <TabsTrigger
                    value="domain"
                    onClick={() => handleDomainPreferenceChange("domain")}
                  >
                    Domain Only
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    onClick={() => handleDomainPreferenceChange("url")}
                  >
                    Full url
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </fieldset>
          </div>
          <div>
            <fieldset className="space-y-1">
              <Label>Browser Filter:</Label>
              <Tabs value={filterType}>
                <TabsList>
                  <TabsTrigger
                    value="denylist"
                    onClick={() => handleFilterTypeChange("denylist")}
                  >
                    All except denied sites
                  </TabsTrigger>
                  <TabsTrigger
                    value="allowlist"
                    onClick={() => handleFilterTypeChange("allowlist")}
                  >
                    Only allowed sites
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="denylist">
                  <fieldset className="space-y-1">
                    <Label>Denylist</Label>
                    <Textarea
                      defaultValue={denylist}
                      onChange={(e) =>
                        debouncedSetDenylist(e.currentTarget.value)
                      }
                      className="resize-none"
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Sites that you don't want to show in your reports. Only
                      applicable to browsing activity. One regex per line.
                    </p>
                  </fieldset>
                </TabsContent>
                <TabsContent value="allowlist">
                  <fieldset className="space-y-1">
                    <Label>Allowlist</Label>
                    <Textarea
                      defaultValue={allowlist}
                      onChange={(e) =>
                        debouncedSetAllowlist(e.currentTarget.value)
                      }
                      className="resize-none"
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Sites that you want to show in your reports. Only
                      applicable to browsing activity. One regex per line.
                    </p>
                  </fieldset>
                </TabsContent>
              </Tabs>
            </fieldset>
          </div>
        </div>
      )}
      <div className="flex-1"></div>
      <div>
        <p className="text-sm text-muted-foreground">Version: {appVersion}</p>
      </div>
    </div>
  );
}
