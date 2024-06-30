import { useLayoutEffect } from "react";

export default function MonitoredAppsPage() {
  useLayoutEffect(() => {
    window.document.title = "Monitored Apps";
  }, []);

  return <div>MonitoredApps</div>;
}
