import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SettingsPage from "./pages/Settings";
import MonitoredAppsPage from "./pages/MonitoredApps";

const router = createBrowserRouter([
  {
    path: "/settings",
    Component: SettingsPage,
  },
  {
    path: "/monitored-apps",
    Component: MonitoredAppsPage,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
