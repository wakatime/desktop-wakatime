export type Category =
  | "browsing"
  | "building"
  | "code reviewing"
  | "coding"
  | "communicating"
  | "debugging"
  | "designing"
  | "indexing"
  | "learning"
  | "manual testing"
  | "meeting"
  | "planning"
  | "researching"
  | "running tests"
  | "translating"
  | "writing docs"
  | "writing tests";

export type EntityType = "file" | "app" | "url" | "domain";

export type MonitoredApp =
  | "arcbrowser"
  | "brave"
  | "canva"
  | "chrome"
  | "figma"
  | "firefox"
  | "imessage"
  | "iterm2"
  | "linear"
  | "mac_terminal"
  | "microsoft_access"
  | "microsoft_edge"
  | "microsoft_excel"
  | "microsoft_outlook"
  | "microsoft_onenote"
  | "microsoft_powerpoint"
  | "microsoft_word"
  | "notes"
  | "notion"
  | "postman"
  | "powershell"
  | "safari"
  | "safaripreview"
  | "slack"
  | "tableplus"
  | "warp"
  | "wecom"
  | "whatsapp"
  | "windows_terminal"
  | "xcode"
  | "zoom";

export type MonitoredAppInfo = {
  id: MonitoredApp;
  mac?: {
    bundleId: string;
  };
  windows?: {
    exePath?: string;
    DisplayName?: string;
  };
  isBrowser?: boolean;
  isDefaultEnabled?: boolean;
  isElectronApp?: boolean;
};
