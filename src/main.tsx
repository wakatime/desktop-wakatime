import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app";
import { useAppSettings } from "./stores/app-settings";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("app-settings-change", (_event, appSettings) => {
  useAppSettings.setState({ appSettings });
});
