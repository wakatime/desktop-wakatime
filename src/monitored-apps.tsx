import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { MonitoredAppsPage } from "./pages/MonitoredApps";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MonitoredAppsPage />
  </StrictMode>,
);
