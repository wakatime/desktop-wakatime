import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";

import App from "./app";
import { queryClient } from "./lib/query";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

// Use contextBridge
// window.ipcRenderer.on("app-settings", (_event, appSettings) => {
//   useAppSettings.setState({ appSettings });
// });

// window.ipcRenderer.on("installed-apps", (_event, apps) => {
//   useInstalledApps.setState({ apps });
// });
