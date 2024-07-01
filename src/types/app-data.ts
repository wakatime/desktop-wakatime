export type AppDataMac = {
  uniqueId: string;
  type: "mac";
  appName?: string | null;
  appVersion?: string | null;
  appInstallDate?: string | null;
  appIdentifier?: string | null;
  appCategory?: string | null;
  appCategoryType?: string | null;
  appIcon?: string | null;
  [x: string]: string | undefined | null;
};

export interface AppDataWindows {
  uniqueId: string;
  type: "windows";
  appName?: string | null;
  appIcon?: string | null;
}

export type AppData = AppDataMac | AppDataWindows;
