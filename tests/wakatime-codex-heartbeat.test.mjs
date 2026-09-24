import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "electron",
  "watchers",
  "wakatime.ts",
);
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

let activeWorkspace = "C:\\src\\first-project";
let contextEnabled = true;
const cliCalls = [];
const logger = { log() {} };
const modules = {
  electron: { app: { getVersion: () => "test" } },
  "electron-is-dev": true,
  "electron-updater": { autoUpdater: {} },
  "../helpers/apps-manager": { AppsManager: {} },
  "../helpers/codex-context": {
    isCodexWindow: () => true,
    codexProjectFolder: () => activeWorkspace,
  },
  "../helpers/config-file": {
    ConfigFile: {
      getSetting: (_section, key) =>
        key === "codex_context_enabled" && contextEnabled ? "true" : null,
    },
  },
  "../helpers/dependencies": { Dependencies: {} },
  "../helpers/monitoring-manager": {
    MonitoringManager: { isMonitored: () => true },
  },
  "../helpers/properties-manager": { PropertiesManager: {} },
  "../helpers/settings-manager": { SettingsManager: {} },
  "../utils": {
    exec: async (...args) => {
      cliCalls.push(args);
      return ["", null];
    },
    getCLIPath: () => "wakatime-cli",
    getPlatfrom: () => "windows",
  },
  "../utils/constants": { DeepLink: {} },
  "../utils/logging": {
    Logging: { instance: () => logger },
    LogLevel: { ERROR: 3 },
  },
};
const moduleUnderTest = new Module(sourcePath);
moduleUnderTest.filename = sourcePath;
moduleUnderTest.paths = Module._nodeModulePaths(path.dirname(sourcePath));
moduleUnderTest.require = (id) =>
  id in modules
    ? modules[id]
    : Module.prototype.require.call(moduleUnderTest, id);
moduleUnderTest._compile(compiled, sourcePath);
const { Wakatime } = moduleUnderTest.exports;

const windowInfo = {
  info: {
    path: "C:\\Program Files\\WindowsApps\\OpenAI.Codex_test\\app\\ChatGPT.exe",
    name: "Codex",
    processId: 1234,
  },
};
const heartbeat = {
  windowInfo,
  entity: "ChatGPT",
  entityType: "app",
  category: "coding",
  project: null,
  language: null,
  isWrite: false,
};
function tracker() {
  const instance = Object.create(Wakatime.prototype);
  Object.assign(instance, {
    lastEntitiy: "",
    lastProject: null,
    lastCategory: "coding",
    lastTime: 0,
    versionString: "windows-wakatime/test",
    fetchToday: async () => {},
    checkForUpdates: () => {},
  });
  return instance;
}
function flag(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? null : args[index + 1];
}

test("sends the active Codex workspace and sends again when tasks switch", async () => {
  cliCalls.length = 0;
  contextEnabled = true;
  activeWorkspace = "C:\\src\\first-project";
  const wakatime = tracker();

  await wakatime.sendHeartbeat(heartbeat);
  assert.equal(cliCalls.length, 1);
  assert.equal(flag(cliCalls[0], "--project-folder"), activeWorkspace);
  assert.ok(cliCalls[0].includes("--hide-project-folder"));
  assert.equal(flag(cliCalls[0], "--hide-branch-names"), "true");
  assert.equal(flag(cliCalls[0], "--language"), null);

  activeWorkspace = "C:\\src\\second-project";
  await wakatime.sendHeartbeat(heartbeat);
  assert.equal(cliCalls.length, 2);
  assert.equal(flag(cliCalls[1], "--project-folder"), activeWorkspace);
  assert.equal(flag(cliCalls[1], "--hide-branch-names"), "true");

  await wakatime.sendHeartbeat(heartbeat);
  assert.equal(cliCalls.length, 2);

  activeWorkspace = null;
  await wakatime.sendHeartbeat(heartbeat);
  assert.equal(cliCalls.length, 3);
  assert.equal(flag(cliCalls[2], "--project-folder"), null);
  assert.equal(flag(cliCalls[2], "--hide-branch-names"), null);
  assert.equal(flag(cliCalls[2], "--language"), null);
});

test("leaves normal app heartbeats unchanged when Codex context is disabled", async () => {
  cliCalls.length = 0;
  contextEnabled = false;
  activeWorkspace = "C:\\src\\first-project";

  await tracker().sendHeartbeat(heartbeat);
  assert.equal(cliCalls.length, 1);
  assert.equal(flag(cliCalls[0], "--project-folder"), null);
  assert.equal(flag(cliCalls[0], "--language"), null);
});
