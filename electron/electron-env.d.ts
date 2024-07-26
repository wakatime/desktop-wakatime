/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    DIST: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer & {
    settings: {
      get: () => import("./helpers/settings-manager").Settings;
      set: (
        settings: Partial<import("./helpers/settings-manager").Settings>,
      ) => import("./helpers/settings-manager").Settings;
      reset: () => import("./helpers/settings-manager").Settings;
    };
    getSetting: (section: string, key: string, internal?: boolean) => string;
    setSetting: (
      section: string,
      key: string,
      value: string,
      internal?: boolean,
    ) => string;
    getAppVersion: () => string;
    getInstalledApps: () => import("./helpers/apps-manager").AppData[];
  };
}

declare module "iconutil" {
  export function toIconset(
    path: string,
    callback: (error: unknown, icons: Record<string, Buffer>) => void,
  ): void;
}

declare module "icon-extractor";
