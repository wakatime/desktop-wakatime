import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/query-client";
import { MonitoredAppsPage } from "./pages/MonitoredApps";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MonitoredAppsPage />
    </QueryClientProvider>
  </StrictMode>,
);
