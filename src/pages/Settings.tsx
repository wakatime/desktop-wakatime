import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [keyInput, setKeyInput] = useState("");

  useEffect(() => {
    const key = window.ipcRenderer.store.get("wakatime.key");
    console.log("wakatime.key", key);
    if (typeof key === "string") {
      setKeyInput(key);
    }

    window.document.title = "Settings";
  }, []);

  return (
    <div>
      <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
      <button
        onClick={() => window.ipcRenderer.store.set("wakatime.key", keyInput)}
      >
        Save
      </button>
    </div>
  );
}
