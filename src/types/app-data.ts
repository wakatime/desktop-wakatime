export type AppData = {
  appName?: string | null;
  appVersion?: string | null;
  appInstallDate?: string | null;
  appIdentifier?: string | null;
  appCategory?: string | null;
  appCategoryType?: string | null;
  appIcon?: string | null;
  [x: string]: string | undefined | null;
};
