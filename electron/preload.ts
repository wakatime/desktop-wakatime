import { contextBridge, ipcRenderer } from "electron";

import {
  GET_APP_VERSION_IPC_KEY,
  GET_INSTALLED_APPS_IPC_KEY,
  GET_SETTING_IPC_KEY,
  SET_SETTING_IPC_KEY,
} from "./utils/constants";

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
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getSetting(section: string, key: string, internal = false) {
    return ipcRenderer.sendSync(GET_SETTING_IPC_KEY, section, key, internal);
  },
  setSetting(section: string, key: string, value: string, internal = false) {
    ipcRenderer.send(SET_SETTING_IPC_KEY, section, key, value, internal);
  },
  getInstalledApps() {
    return ipcRenderer.sendSync(GET_INSTALLED_APPS_IPC_KEY);
  },
  getAppVersion() {
    return ipcRenderer.sendSync(GET_APP_VERSION_IPC_KEY);
  },
});
