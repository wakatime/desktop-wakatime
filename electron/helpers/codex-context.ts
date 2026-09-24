import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { WindowInfo } from "@miniben90/x-win";

const taskActivity =
  /^\S+ info \[electron-message-handler\] thread_stream_view_activity_changed active=(true|false) conversationId=([0-9a-f-]{36})/;

export function isCodexWindow(windowInfo: WindowInfo): boolean {
  return (
    process.platform === "win32" &&
    /[\\/]WindowsApps[\\/]OpenAI\.Codex_[^\\/]+[\\/]app[\\/]ChatGPT\.exe$/i.test(
      windowInfo.info.path,
    )
  );
}

function codexLogDirectory(executable: string): string | null {
  const packageName = executable.match(
    /[\\/]WindowsApps[\\/]OpenAI\.Codex_[^\\/]+__([^\\/]+)[\\/]app[\\/]ChatGPT\.exe$/i,
  )?.[1];
  const localAppData = process.env.LOCALAPPDATA;
  if (!packageName || !localAppData) return null;
  return path.join(
    localAppData,
    "Packages",
    `OpenAI.Codex_${packageName}`,
    "LocalCache",
    "Local",
    "Codex",
    "Logs",
  );
}

function latestProcessLog(root: string, processId: number): string | null {
  let latest: { file: string; modified: number } | null = null;
  for (const year of fs.readdirSync(root, { withFileTypes: true })) {
    if (!year.isDirectory() || !/^\d{4}$/.test(year.name)) continue;
    const yearPath = path.join(root, year.name);
    for (const month of fs.readdirSync(yearPath, { withFileTypes: true })) {
      if (!month.isDirectory() || !/^\d{2}$/.test(month.name)) continue;
      const monthPath = path.join(yearPath, month.name);
      for (const day of fs.readdirSync(monthPath, { withFileTypes: true })) {
        if (!day.isDirectory() || !/^\d{2}$/.test(day.name)) continue;
        const dayPath = path.join(monthPath, day.name);
        for (const file of fs.readdirSync(dayPath, { withFileTypes: true })) {
          if (
            !file.isFile() ||
            !file.name.includes(`-${processId}-t0-`) ||
            !file.name.endsWith(".log")
          ) {
            continue;
          }
          const filePath = path.join(dayPath, file.name);
          const modified = fs.statSync(filePath).mtimeMs;
          if (!latest || modified > latest.modified) {
            latest = { file: filePath, modified };
          }
        }
      }
    }
  }
  return latest?.file ?? null;
}

export function activeCodexThreadId(log: string): string | null {
  let threadId: string | null = null;
  for (const line of log.split(/\r?\n/)) {
    const match = line.match(taskActivity);
    if (!match) continue;
    if (match[1] === "true") threadId = match[2];
    else if (threadId === match[2]) threadId = null;
  }
  return threadId;
}

function sessionDirectories(id: string, codexHome: string): string[] {
  const timestamp = Number.parseInt(id.replace(/-/g, "").slice(0, 12), 16);
  if (!Number.isFinite(timestamp)) return [];
  const directories = new Set<string>();
  for (const offset of [-1, 0, 1]) {
    const day = new Date(timestamp + offset * 86400000);
    for (const useUtc of [false, true]) {
      const year = useUtc ? day.getUTCFullYear() : day.getFullYear();
      const month = (useUtc ? day.getUTCMonth() : day.getMonth()) + 1;
      const date = useUtc ? day.getUTCDate() : day.getDate();
      directories.add(
        path.join(
          codexHome,
          "sessions",
          String(year),
          String(month).padStart(2, "0"),
          String(date).padStart(2, "0"),
        ),
      );
    }
  }
  directories.add(path.join(codexHome, "archived_sessions"));
  return [...directories];
}

function sessionFile(id: string, codexHome: string): string | null {
  for (const directory of sessionDirectories(id, codexHome)) {
    if (!fs.existsSync(directory)) continue;
    const filename = fs
      .readdirSync(directory)
      .find((name) => name.endsWith(`-${id}.jsonl`));
    if (filename) return path.join(directory, filename);
  }
  return null;
}

export function projectFolderFromSessionMetadata(
  file: string,
  expectedId: string,
): string | null {
  const descriptor = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(1024 * 1024);
    const length = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
    const newline = buffer.subarray(0, length).indexOf(10);
    if (newline < 0) return null;
    const firstLine = JSON.parse(buffer.toString("utf8", 0, newline)) as {
      type?: string;
      payload?: { id?: string; cwd?: string };
    };
    if (
      firstLine.type !== "session_meta" ||
      firstLine.payload?.id !== expectedId
    ) {
      return null;
    }
    const cwd = firstLine.payload.cwd?.trim();
    if (!cwd) return null;
    return path.win32.isAbsolute(cwd) ? cwd : null;
  } finally {
    fs.closeSync(descriptor);
  }
}

export function codexProjectFolder(windowInfo: WindowInfo): string | null {
  if (!isCodexWindow(windowInfo) || !windowInfo.info.processId) return null;
  try {
    const logDirectory = codexLogDirectory(windowInfo.info.path);
    if (!logDirectory) return null;
    const logFile = latestProcessLog(logDirectory, windowInfo.info.processId);
    if (!logFile) return null;
    const threadId = activeCodexThreadId(fs.readFileSync(logFile, "utf8"));
    if (!threadId) return null;
    const codexHome =
      process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
    const file = sessionFile(threadId, codexHome);
    return file ? projectFolderFromSessionMetadata(file, threadId) : null;
  } catch {
    // Codex may change its log format or keep a session only in the cloud.
    return null;
  }
}
