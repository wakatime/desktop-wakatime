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
      get: () => import("../src/validators/app-settings").AppSettings;
      set: (
        settings: import("../src/validators/app-settings").AppSettings,
      ) => void;
    };
    getAppVersion: () => string;
  };
}

declare module "iconutil" {
  export function toIconset(
    path: string,
    callback: (error: unknown, icons: Record<string, Buffer>) => void,
  ): void;
}
