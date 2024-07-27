import { useState } from "react";

export const useApiKey = () => {
  const [apiKey, _setApiKey] = useState(() =>
    window.ipcRenderer.getSetting("settings", "api_key"),
  );

  const setApiKey = (apiKey: string) => {
    _setApiKey(apiKey);
    window.ipcRenderer.setSetting("settings", "api_key", apiKey);
  };

  return {
    apiKey,
    setApiKey,
  };
};
