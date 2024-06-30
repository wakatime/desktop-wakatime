import { useLayoutEffect } from "react";

export default function SettingsPage() {
  useLayoutEffect(() => {
    window.document.title = "Settings";
  }, []);

  return <div>Settings</div>;
}
