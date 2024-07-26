import { useEffect, useState } from "react";

export const useApiKey = () => {
  const [apiKey, _setApiKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const apiKey = window.ipcRenderer.getSetting("settings", "api_key");
      _setApiKey(apiKey);
    }
  }, []);

  const setApiKey = (apiKey: string) => {
    _setApiKey(apiKey);
    window.ipcRenderer.setSetting("settings", "api_key", apiKey);
  };

  return {
    apiKey,
    setApiKey,
  };
};
