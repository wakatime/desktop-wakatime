import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(
  __dirname,
  "..",
  "electron",
  "helpers",
  "codex-context.ts",
);
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;
const moduleUnderTest = new Module(sourcePath);
moduleUnderTest.filename = sourcePath;
moduleUnderTest.paths = Module._nodeModulePaths(path.dirname(sourcePath));
moduleUnderTest._compile(compiled, sourcePath);
const {
  activeCodexThreadId,
  codexProjectFolder,
  isCodexWindow,
  projectFolderFromSessionMetadata,
} = moduleUnderTest.exports;

const configReaderPath = path.join(
  __dirname,
  "..",
  "electron",
  "helpers",
  "config-file-reader.ts",
);
const configReaderCompiled = ts.transpileModule(
  fs.readFileSync(configReaderPath, "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  },
).outputText;
const configReaderModule = new Module(configReaderPath);
configReaderModule.filename = configReaderPath;
configReaderModule.paths = Module._nodeModulePaths(
  path.dirname(configReaderPath),
);
configReaderModule.require = (id) => {
  if (id === "../utils/logging") {
    return {
      Logging: { instance: () => ({ log() {} }) },
      LogLevel: { ERROR: 3 },
    };
  }
  return Module.prototype.require.call(configReaderModule, id);
};
configReaderModule._compile(configReaderCompiled, configReaderPath);
const { ConfigFileReader } = configReaderModule.exports;

const firstId = "01a0d044-1221-7110-9f1f-49d7ef3d6335";
const secondId = "01a0d046-38c5-7723-b89e-73de796aa997";
const event = (active, id) =>
  `2026-09-24T08:00:00.000Z info [electron-message-handler] thread_stream_view_activity_changed active=${active} conversationId=${id}`;

test("reads opt-in settings from Windows CRLF config files", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "wakatime-config-test-"));
  try {
    const file = path.join(temp, ".wakatime.cfg");
    fs.writeFileSync(
      file,
      "[settings]\r\napi_key = example\r\ncodex_context_enabled = true\r\n",
    );
    assert.equal(ConfigFileReader.get(file, "settings", "api_key"), "example");
    assert.equal(
      ConfigFileReader.get(file, "settings", "codex_context_enabled"),
      "true",
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("uses the last active task view and clears it on deactivation", () => {
  const lines = [
    event("true", firstId),
    event("false", firstId),
    event("true", secondId),
  ];
  assert.equal(activeCodexThreadId(lines.join("\n")), secondId);
  assert.equal(activeCodexThreadId(lines.slice(0, 2).join("\n")), null);
  assert.equal(
    activeCodexThreadId(
      `${event("true", firstId)}\n${event("false", secondId)}`,
    ),
    firstId,
  );
});

test("reads only matching session metadata for the workspace", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "wakatime-codex-test-"));
  try {
    const file = path.join(temp, "rollout.jsonl");
    fs.writeFileSync(
      file,
      JSON.stringify({
        type: "session_meta",
        payload: {
          id: firstId,
          cwd: "C:\\src\\example-project",
          base_instructions: "private",
        },
      }) +
        "\n" +
        JSON.stringify({ type: "event_msg", payload: { text: "private" } }) +
        "\n",
    );
    assert.equal(
      projectFolderFromSessionMetadata(file, firstId),
      "C:\\src\\example-project",
    );
    assert.equal(projectFolderFromSessionMetadata(file, secondId), null);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("maps a Codex desktop heartbeat to the active task workspace", () => {
  if (process.platform !== "win32") return;
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "wakatime-codex-test-"));
  const previousLocalAppData = process.env.LOCALAPPDATA;
  const previousCodexHome = process.env.CODEX_HOME;
  try {
    process.env.LOCALAPPDATA = path.join(temp, "AppData");
    process.env.CODEX_HOME = path.join(temp, ".codex");
    const packageFamily = "OpenAI.Codex_2p2nqsd0c76g0";
    const day = new Date(
      Number.parseInt(firstId.replace(/-/g, "").slice(0, 12), 16),
    );
    const sessionDirectory = path.join(
      process.env.CODEX_HOME,
      "sessions",
      String(day.getFullYear()),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    );
    fs.mkdirSync(sessionDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(sessionDirectory, `rollout-test-${firstId}.jsonl`),
      JSON.stringify({
        type: "session_meta",
        payload: { id: firstId, cwd: "C:\\src\\repo" },
      }) + "\n",
    );
    fs.writeFileSync(
      path.join(sessionDirectory, `rollout-test-${secondId}.jsonl`),
      JSON.stringify({
        type: "session_meta",
        payload: { id: secondId, cwd: "C:\\src\\other-repo" },
      }) + "\n",
    );
    const logDirectory = path.join(
      process.env.LOCALAPPDATA,
      "Packages",
      packageFamily,
      "LocalCache",
      "Local",
      "Codex",
      "Logs",
      "2026",
      "09",
      "24",
    );
    fs.mkdirSync(logDirectory, { recursive: true });
    const logFile = path.join(
      logDirectory,
      "codex-desktop-test-1234-t0-i1.log",
    );
    fs.writeFileSync(logFile, `${event("true", firstId)}\n`);
    const windowInfo = {
      info: {
        path: "C:\\Program Files\\WindowsApps\\OpenAI.Codex_26.917.9434.0_x64__2p2nqsd0c76g0\\app\\ChatGPT.exe",
        processId: 1234,
      },
    };
    assert.equal(isCodexWindow(windowInfo), true);
    assert.equal(codexProjectFolder(windowInfo), "C:\\src\\repo");
    fs.appendFileSync(
      logFile,
      `${event("false", firstId)}\n${event("true", secondId)}\n`,
    );
    assert.equal(codexProjectFolder(windowInfo), "C:\\src\\other-repo");
    fs.appendFileSync(logFile, `${event("false", secondId)}\n`);
    assert.equal(codexProjectFolder(windowInfo), null);
    assert.equal(
      codexProjectFolder({
        info: { path: "C:\\Other\\ChatGPT.exe", processId: 1234 },
      }),
      null,
    );
  } finally {
    if (previousLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = previousLocalAppData;
    if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = previousCodexHome;
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
