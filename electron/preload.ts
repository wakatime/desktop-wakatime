import { contextBridge, ipcRenderer } from "electron";

import { IpcKeys } from "./utils/constants";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  sendSync(...args: Parameters<typeof ipcRenderer.sendSync>) {
    const [channel, ...omit] = args;
    return ipcRenderer.sendSync(channel, ...omit);
  },
  shell: {
    openExternal: (url: string) => {
      ipcRenderer.send(IpcKeys.shellOpenExternal, url);
    },
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getSetting(section: string, key: string, internal = false) {
    return ipcRenderer.sendSync(IpcKeys.getSetting, section, key, internal);
  },
  setSetting(section: string, key: string, value: string, internal = false) {
    ipcRenderer.send(IpcKeys.setSetting, section, key, value, internal);
  },
  isMonitored(path: string) {
    return ipcRenderer.sendSync(IpcKeys.isMonitored, path);
  },
  setMonitored(path: string, monitor: boolean) {
    ipcRenderer.send(IpcKeys.setMonitored, path, monitor);
  },
  getAllApps() {
    return ipcRenderer.sendSync(IpcKeys.getAllApps);
  },
  getOpenApps() {
    return ipcRenderer.sendSync(IpcKeys.getOpenApps);
  },
  getAllAvailableApps() {
    return ipcRenderer.sendSync(IpcKeys.getAllAvailableApps);
  },
  getAppVersion() {
    return ipcRenderer.sendSync(IpcKeys.getAppVersion);
  },
  getPlatform() {
    return ipcRenderer.sendSync(IpcKeys.getPlatform);
  },
  autoUpdateEnabled() {
    return ipcRenderer.sendSync(IpcKeys.autoUpdateEnabled);
  },
  setAutoUpdateEnabled(autoUpdateEnabled: boolean) {
    ipcRenderer.send(IpcKeys.setAutoUpdateEnabled, autoUpdateEnabled);
  },
  shouldLaunchOnLogIn() {
    return ipcRenderer.sendSync(IpcKeys.shouldLaunchOnLogin);
  },
  setShouldLaunchOnLogIn(shouldLaunchOnLogIn: boolean) {
    ipcRenderer.send(IpcKeys.setShouldLaunchOnLogin, shouldLaunchOnLogIn);
  },
  codeTimeInStatusBar() {
    return ipcRenderer.sendSync(IpcKeys.codeTimeInStatusBar);
  },
  setCodeTimeInStatusBar(codeTimeInStatusBar: boolean) {
    ipcRenderer.send(IpcKeys.setCodeTimeInStatusBar, codeTimeInStatusBar);
  },
  shouldLogToFile() {
    return ipcRenderer.sendSync(IpcKeys.shouldLogToFile);
  },
  setShouldLogToFile(shouldLogToFile: boolean) {
    ipcRenderer.send(IpcKeys.setShouldLogToFile, shouldLogToFile);
  },
  setDebugMode(debugMode: boolean) {
    ipcRenderer.send(IpcKeys.setDebugMode, debugMode);
  },
});
