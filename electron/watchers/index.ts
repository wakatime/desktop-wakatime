export type MonitoredAppInfo = {
  mac?: {
    bundleId: string;
  };
  windows?: {
    exePath?: string;
    DisplayName?: string;
  };
};

export const MonitoredApp = {
  arcbrowser: {
    mac: {
      bundleId: "company.thebrowser.Browser",
    },
    windows: {
      exePath: "arc.exe",
      DisplayName: "Arc",
    },
  },
  brave: {
    mac: {
      bundleId: "com.brave.Browser",
    },
    windows: {
      exePath: "brave.exe",
      DisplayName: "Brave",
    },
  },
  canva: {
    mac: {
      bundleId: "com.canva.CanvaDesktop",
    },
    windows: {
      exePath: "Canva.exe",
      DisplayName: "Canva",
    },
  },
  chrome: {
    mac: {
      bundleId: "com.google.Chrome",
    },
    windows: {
      exePath: "chrome.exe",
      DisplayName: "Google Chrome",
    },
  },
  figma: {
    mac: {
      bundleId: "com.figma.Desktop",
    },
    windows: {
      exePath: "Figma.exe",
      DisplayName: "Figma",
    },
  },
  firefox: {
    mac: {
      bundleId: "org.mozilla.firefox",
    },
    windows: {
      exePath: "firefox.exe",
      DisplayName: "Mozilla Firefox",
    },
  },
  imessage: {
    mac: {
      bundleId: "com.apple.MobileSMS",
    },
  },
  iterm2: {
    mac: {
      bundleId: "com.googlecode.iterm2",
    },
  },
  powershell: {
    windows: {
      exePath: "PowerShell.exe",
      DisplayName: "Windows Powershell",
    },
  },
  linear: {
    mac: {
      bundleId: "com.linear",
    },
    windows: {
      exePath: "Linear.exe",
      DisplayName: "Linear",
    },
  },
  notes: {
    mac: {
      bundleId: "com.apple.Notes",
    },
  },
  notion: {
    mac: {
      bundleId: "notion.id",
    },
    windows: {
      exePath: "Notion.exe",
      DisplayName: "Notion",
    },
  },
  postman: {
    mac: {
      bundleId: "com.postmanlabs.mac",
    },
    windows: {
      exePath: "Postman.exe",
      DisplayName: "Postman",
    },
  },
  safari: {
    mac: {
      bundleId: "com.apple.Safari",
    },
  },
  safaripreview: {
    mac: {
      bundleId: "com.apple.SafariTechnologyPreview",
    },
  },
  microsoftEdge: {
    windows: {
      exePath: "msedge.exe",
      DisplayName: "Microsoft Edge",
    },
  },
  slack: {
    mac: {
      bundleId: "com.tinyspeck.slackmacgap",
    },
    windows: {
      exePath: "slack.exe",
      DisplayName: "Slack",
    },
  },
  tableplus: {
    mac: {
      bundleId: "com.tinyapp.TablePlus",
    },
    windows: {
      exePath: "TablePlus.exe",
      DisplayName: "TablePlus",
    },
  },
  macTerminal: {
    mac: {
      bundleId: "com.apple.Terminal",
    },
  },
  windowsTerminal: {
    windows: {
      exePath: "terminal.exe",
      DisplayName: "Terminal",
    },
  },
  warp: {
    mac: {
      bundleId: "dev.warp.Warp-Stable",
    },
  },
  wecom: {
    mac: {
      bundleId: "com.tencent.WeWorkMac",
    },
  },
  whatsapp: {
    mac: {
      bundleId: "net.whatsapp.WhatsApp",
    },
    windows: {
      DisplayName: "WhatsApp",
    },
  },
  xcode: {
    mac: {
      bundleId: "com.apple.dt.Xcode",
    },
  },
  zoom: {
    mac: {
      bundleId: "us.zoom.xos",
    },
    windows: {
      exePath: "Zoom.exe",
      DisplayName: "Zoom",
    },
  },
} as const satisfies Record<string, MonitoredAppInfo>;

export const allApps: MonitoredAppInfo[] = Object.values(MonitoredApp);

export const electronApps: MonitoredAppInfo[] = [
  MonitoredApp.figma,
  MonitoredApp.slack,
];

export const browserApps: MonitoredAppInfo[] = [
  MonitoredApp.arcbrowser,
  MonitoredApp.brave,
  MonitoredApp.chrome,
  MonitoredApp.firefox,
  MonitoredApp.safari,
  MonitoredApp.safaripreview,
  MonitoredApp.microsoftEdge,
];

export const defaultEnabledApps: MonitoredAppInfo[] = [
  MonitoredApp.canva,
  MonitoredApp.figma,
  MonitoredApp.linear,
  MonitoredApp.notes,
  MonitoredApp.notion,
  MonitoredApp.postman,
  MonitoredApp.tableplus,
  MonitoredApp.xcode,
  MonitoredApp.zoom,
];
