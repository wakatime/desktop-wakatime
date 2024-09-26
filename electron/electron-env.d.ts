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
  ipcRenderer?: import("electron").IpcRenderer & {
    getSetting: (
      section: string,
      key: string,
      internal?: boolean,
    ) => string | null;
    setSetting: (
      section: string,
      key: string,
      value: string,
      internal?: boolean,
    ) => string;
    shell: {
      openExternal: (url: string) => void;
    };
    isMonitored: (path: string) => boolean;
    setMonitored: (
      app: import("./utils/validators").AppData,
      monitor: boolean,
    ) => void;
    getAppVersion: () => string;
    getAllApps: () => import("./utils/validators").AppData[];
    getOpenApps: () => Promise<import("./utils/validators").AppData[]>;
    getAllAvailableApps: () => Promise<import("./utils/validators").AppData[]>;
    shouldLaunchOnLogIn: () => boolean;
    setShouldLaunchOnLogIn: (shouldLaunchOnLogIn: boolean) => void;
    shouldLogToFile: () => boolean;
    setShouldLogToFile: (shouldLogToFile: boolean) => void;
    autoUpdateEnabled: () => boolean;
    setAutoUpdateEnabled: (autoUpdateEnabled: boolean) => void;
    codeTimeInStatusBar: () => boolean;
    setCodeTimeInStatusBar: (codeTimeInStatusBar: boolean) => void;
  };
}

declare module "iconutil" {
  export function toIconset(
    path: string,
    callback: (error: unknown, icons: Record<string, Buffer>) => void,
  ): void;
}

declare module "icon-promise" {
  interface IconPromiseOptions {
    path: string;
    sizeArg?: string;
    context?: string;
  }

  interface IconData {
    Base64ImageData: string;
    Path: string;
    Context: string;
  }

  class IconPromise {
    /**
     * Extracts image data from a file's icon with an adjustable size.
     * @param options - Options for extracting the icon.
     * @returns A promise that resolves to an object containing the icon image data.
     */
    getIcon(options: IconPromiseOptions): Promise<IconData>;

    /**
     * Extracts image data from a file's icon with the size set as 16x16 pixels.
     * @param path - The file path for the document to extract the icon from.
     * @param context - Optional context string.
     * @returns A promise that resolves to an object containing the icon image data.
     */
    getIcon16(path: string, context?: string): Promise<IconData>;

    /**
     * Extracts image data from a file's icon with the size set as 32x32 pixels.
     * @param path - The file path for the document to extract the icon from.
     * @param context - Optional context string.
     * @returns A promise that resolves to an object containing the icon image data.
     */
    getIcon32(path: string, context?: string): Promise<IconData>;

    /**
     * Extracts image data from a file's icon with the size set as 48x48 pixels.
     * @param path - The file path for the document to extract the icon from.
     * @param context - Optional context string.
     * @returns A promise that resolves to an object containing the icon image data.
     */
    getIcon48(path: string, context?: string): Promise<IconData>;

    /**
     * Extracts image data from a file's icon with the size set as 256x256 pixels.
     * @param path - The file path for the document to extract the icon from.
     * @param context - Optional context string.
     * @returns A promise that resolves to an object containing the icon image data.
     */
    getIcon256(path: string, context?: string): Promise<IconData>;

    /**
     * Manually sets the path of the IconExtractor executable.
     * @param extractorPath - The new folder path for the IconExtractor executable file.
     * @param newName - Optional new name of the IconExtractor executable file (without extension).
     */
    overrideExtractorPath(extractorPath: string, newName?: string): void;
  }

  const iconPromise: IconPromise;
  export default iconPromise;
}
