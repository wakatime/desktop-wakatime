import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app";
import { useAppSettings } from "./stores/app-settings";
import { useInstalledApps } from "./stores/installed-apps";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("app-settings", (_event, appSettings) => {
  useAppSettings.setState({ appSettings });
});

window.ipcRenderer.on("installed-apps", (_event, apps) => {
  useInstalledApps.setState({ apps });
});
