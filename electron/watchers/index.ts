export type MonitoredAppInfo = {
  id: string;
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

export const allApps = [
  {
    id: "arcbrowser",
    mac: {
      bundleId: "company.thebrowser.Browser",
    },
    windows: {
      exePath: "arc.exe",
      DisplayName: "Arc",
    },
    isBrowser: true,
  },
  {
    id: "brave",
    mac: {
      bundleId: "com.brave.Browser",
    },
    windows: {
      exePath: "brave.exe",
      DisplayName: "Brave",
    },
    isBrowser: true,
  },
  {
    id: "canva",
    mac: {
      bundleId: "com.canva.CanvaDesktop",
    },
    windows: {
      exePath: "Canva.exe",
      DisplayName: "Canva",
    },
    isDefaultEnabled: true,
  },
  {
    id: "chrome",
    mac: {
      bundleId: "com.google.Chrome",
    },
    windows: {
      exePath: "chrome.exe",
      DisplayName: "Google Chrome",
    },
    isBrowser: true,
  },
  {
    id: "figma",
    mac: {
      bundleId: "com.figma.Desktop",
    },
    windows: {
      exePath: "Figma.exe",
      DisplayName: "Figma",
    },
    isElectronApp: true,
    isDefaultEnabled: true,
  },
  {
    id: "firefox",
    mac: {
      bundleId: "org.mozilla.firefox",
    },
    windows: {
      exePath: "firefox.exe",
      DisplayName: "Mozilla Firefox",
    },
    isBrowser: true,
  },
  {
    id: "imessage",
    mac: {
      bundleId: "com.apple.MobileSMS",
    },
  },
  {
    id: "iterm2",
    mac: {
      bundleId: "com.googlecode.iterm2",
    },
  },
  {
    id: "powershell",
    windows: {
      exePath: "PowerShell.exe",
      DisplayName: "Windows Powershell",
    },
  },
  {
    id: "linear",
    mac: {
      bundleId: "com.linear",
    },
    windows: {
      exePath: "Linear.exe",
      DisplayName: "Linear",
    },
    isDefaultEnabled: true,
  },
  {
    id: "notes",
    mac: {
      bundleId: "com.apple.Notes",
    },
    isDefaultEnabled: true,
  },
  {
    id: "notion",
    mac: {
      bundleId: "notion.id",
    },
    windows: {
      exePath: "Notion.exe",
      DisplayName: "Notion",
    },
    isDefaultEnabled: true,
  },
  {
    id: "postman",
    mac: {
      bundleId: "com.postmanlabs.mac",
    },
    windows: {
      exePath: "Postman.exe",
      DisplayName: "Postman",
    },
    isDefaultEnabled: true,
  },
  {
    id: "safari",
    mac: {
      bundleId: "com.apple.Safari",
    },
    isBrowser: true,
  },
  {
    id: "safaripreview",
    mac: {
      bundleId: "com.apple.SafariTechnologyPreview",
    },
    isBrowser: true,
  },
  {
    id: "microsoftEdge",
    windows: {
      exePath: "msedge.exe",
      DisplayName: "Microsoft Edge",
    },
    isBrowser: true,
  },
  {
    id: "slack",
    mac: {
      bundleId: "com.tinyspeck.slackmacgap",
    },
    windows: {
      exePath: "slack.exe",
      DisplayName: "Slack",
    },
    isElectronApp: true,
  },
  {
    id: "tableplus",
    mac: {
      bundleId: "com.tinyapp.TablePlus",
    },
    windows: {
      exePath: "TablePlus.exe",
      DisplayName: "TablePlus",
    },
    isDefaultEnabled: true,
  },
  {
    id: "mac_terminal",
    mac: {
      bundleId: "com.apple.Terminal",
    },
  },
  {
    id: "windows_terminal",
    windows: {
      exePath: "terminal.exe",
      DisplayName: "Terminal",
    },
  },
  {
    id: "warp",
    mac: {
      bundleId: "dev.warp.Warp-Stable",
    },
  },
  {
    id: "wecom",
    mac: {
      bundleId: "com.tencent.WeWorkMac",
    },
  },
  {
    id: "whatsapp",
    mac: {
      bundleId: "net.whatsapp.WhatsApp",
    },
    windows: {
      DisplayName: "WhatsApp",
    },
  },
  {
    id: "xcode",
    mac: {
      bundleId: "com.apple.dt.Xcode",
    },
    isDefaultEnabled: true,
  },
  {
    id: "zoom",
    mac: {
      bundleId: "us.zoom.xos",
    },
    windows: {
      exePath: "Zoom.exe",
      DisplayName: "Zoom",
    },
    isDefaultEnabled: true,
  },
];
