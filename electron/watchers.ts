export type AppData = {
  name: string;
  mac?: {
    bundleId: string;
  };
  windows?: {
    registryPaths: string[];
  };
};

export const MonitoredApp = {
  arcbrowser: {
    name: "Arc",
    mac: {
      bundleId: "company.thebrowser.Browser",
    },
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\arc.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\arc.exe",
      ],
    },
  },
  brave: {
    name: "Brave",
    mac: {
      bundleId: "com.brave.Browser",
    },
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\brave.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\brave.exe",
      ],
    },
  },
  canva: {
    name: "Canva",
    mac: {
      bundleId: "com.canva.CanvaDesktop",
    },
    windows: {
      registryPaths: [],
    },
  },
  chrome: {
    name: "Chrome",
    mac: {
      bundleId: "com.google.Chrome",
    },
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
      ],
    },
  },
  figma: {
    name: "Figma",
    mac: {
      bundleId: "com.figma.Desktop",
    },
    windows: {
      registryPaths: [],
    },
  },
  firefox: {
    name: "Firefox",
    mac: {
      bundleId: "org.mozilla.firefox",
    },
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\firefox.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\firefox.exe",
      ],
    },
  },
  imessage: {
    name: "Messages",
    mac: {
      bundleId: "com.apple.MobileSMS",
    },
  },
  iterm2: {
    name: "iTerm2",
    mac: {
      bundleId: "com.googlecode.iterm2",
    },
  },
  powershell: {
    name: "PowerShell",
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\PowerShell.exe",
      ],
    },
  },
  linear: {
    name: "Linear",
    mac: {
      bundleId: "com.linear",
    },
    windows: {
      registryPaths: [],
    },
  },
  notes: {
    name: "Notes",
    mac: {
      bundleId: "com.apple.Notes",
    },
  },
  notion: {
    name: "Notion",
    mac: {
      bundleId: "notion.id",
    },
    windows: {
      registryPaths: [],
    },
  },
  postman: {
    name: "Postman",
    mac: {
      bundleId: "com.postmanlabs.mac",
    },
    windows: {
      registryPaths: [],
    },
  },
  safari: {
    name: "Safari",
    mac: {
      bundleId: "com.apple.Safari",
    },
  },
  safaripreview: {
    name: "Safari Preview",
    mac: {
      bundleId: "com.apple.SafariTechnologyPreview",
    },
  },
  microsoftEdge: {
    name: "Microsoft Edge",
    windows: {
      registryPaths: [
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe",
      ],
    },
  },
  slack: {
    name: "Slack",
    mac: {
      bundleId: "com.tinyspeck.slackmacgap",
    },
    windows: {
      registryPaths: [
        "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Slack.exe",
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Slack.exe",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Slack.exe",
      ],
    },
  },
  tableplus: {
    name: "TablePlus",
    mac: {
      bundleId: "com.tinyapp.TablePlus",
    },
    windows: {
      registryPaths: [],
    },
  },
  macTerminal: {
    name: "Terminal",
    mac: {
      bundleId: "com.apple.Terminal",
    },
  },
  windowsTerminal: {
    name: "Terminal",
    windows: {
      registryPaths: [],
    },
  },
  warp: {
    name: "Wrap",
    mac: {
      bundleId: "dev.warp.Warp-Stable",
    },
    windows: {
      registryPaths: [],
    },
  },
  wecom: {
    name: "WeCom",
    mac: {
      bundleId: "com.tencent.WeWorkMac",
    },
    windows: {
      registryPaths: [],
    },
  },
  whatsapp: {
    name: "WhatsApp",
    mac: {
      bundleId: "net.whatsapp.WhatsApp",
    },
    windows: {
      registryPaths: [],
    },
  },
  xcode: {
    name: "xCode",
    mac: {
      bundleId: "com.apple.dt.Xcode",
    },
  },
  zoom: {
    name: "Zoom",
    mac: {
      bundleId: "us.zoom.xos",
    },
    windows: {
      registryPaths: [],
    },
  },
} as const satisfies Record<string, AppData>;

export const allApps: AppData[] = Object.values(MonitoredApp);

export const electronApps: AppData[] = [MonitoredApp.figma, MonitoredApp.slack];

export const browserApps: AppData[] = [
  MonitoredApp.arcbrowser,
  MonitoredApp.brave,
  MonitoredApp.chrome,
  MonitoredApp.firefox,
  MonitoredApp.safari,
  MonitoredApp.safaripreview,
  MonitoredApp.microsoftEdge,
];

export const defaultEnabledApps: AppData[] = [
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
