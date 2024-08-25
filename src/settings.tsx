import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/query-client";
import { SettingsPage } from "./pages/Settings";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
    </QueryClientProvider>
  </StrictMode>,
);
