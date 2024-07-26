import { useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useApiKey } from "~/hooks/useApiKey";
import { useAppVersion } from "~/utils/queries";

export function Component() {
  const { apiKey, setApiKey } = useApiKey();
  const appVersionQuery = useAppVersion();

  const debouncedSetApiKey = useDebounceCallback((key: string) => {
    setApiKey(key);
  }, 200);

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
          <Checkbox id="launch-at-login" className="mt-1" />
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
