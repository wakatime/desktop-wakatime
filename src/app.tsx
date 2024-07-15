import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/settings",
    lazy: () => import("./pages/Settings"),
  },
  {
    path: "/monitored-apps",
    lazy: () => import("./pages/MonitoredApps"),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
