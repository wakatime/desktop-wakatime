export const PLUGINS: {
  execNames: string[];
  bundleIds?: string[];
  url: string;
  type: "extension" | "plugin";
}[] = [
  {
    execNames: [
      "Visual Studio Code.app",
      "Visual Studio Code - Insiders.app",
      "Code.exe",
      "Code - Insiders.exe",
    ],
    bundleIds: ["com.microsoft.VSCode", "com.microsoft.VSCodeInsiders"],
    url: "https://wakatime.com/vs-code",
    type: "plugin",
  },
  {
    execNames: ["Sublime Text.app", "sublime_text.exe"],
    url: "https://wakatime.com/sublime-text",
    type: "plugin",
  },
  {
    execNames: ["Discord.app", "Discord.exe"],
    bundleIds: ["com.hnc.Discord"],
    url: "https://wakatime.com/discord",
    type: "plugin",
  },
  {
    execNames: ["Visual Studio.app", "devenv.exe"],
    bundleIds: ["com.microsoft.visual-studio"],
    url: "https://wakatime.com/visual-studio",
    type: "plugin",
  },
  {
    execNames: ["Unity Hub.app", "Unity.app", "Unity Hub.exe", "Unity.exe"],
    bundleIds: ["com.unity3d.unityhub"],
    url: "https://wakatime.com/unity",
    type: "plugin",
  },
  {
    execNames: ["TextMate.app"],
    bundleIds: ["com.macromates.TextMate"],
    url: "https://wakatime.com/textmate",
    type: "plugin",
  },
  {
    execNames: ["Android Studio.app", "studio64.exe"],
    bundleIds: ["com.google.android.studio"],
    url: "https://wakatime.com/android-studio",
    type: "plugin",
  },
  {
    execNames: ["Obsidian.app", "Obsidian.exe"],
    bundleIds: ["md.obsidian"],
    url: "https://wakatime.com/obsidian",
    type: "plugin",
  },
  {
    execNames: [
      // Mac
      "Arc.app",
      "Brave.app",
      "Google Chrome.app",
      "Opera.app",
      "Microsoft Edge.app",
      // Windows
      "arc.exe",
      "brave.exe",
      "chrome.exe",
      "opera.exe",
      "msedge.exe",
    ],
    bundleIds: [
      "com.microsoft.edgemac",
      "company.thebrowser.Browser",
      "com.brave.Browser",
      "com.google.Chrome",
      "com.operasoftware.OperaDeveloper",
    ],
    url: "https://chromewebstore.google.com/detail/wakatime/jnbbnacmeggbgdjgaoojpmhdlkkpblgi",
    type: "extension",
  },
  {
    execNames: ["Firefox.app", "firefox.exe"],
    bundleIds: ["org.mozilla.firefox"],
    url: "https://addons.mozilla.org/en-US/firefox/addon/wakatimes/",
    type: "extension",
  },
  {
    execNames: ["RobloxStudioBeta.exe", "RobloxStudio.app"],
    bundleIds: ["com.roblox.RobloxStudio"],
    url: "https://wakatime.com/roblox-studio",
    type: "plugin",
  },
];
