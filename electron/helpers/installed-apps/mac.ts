import { exec, spawnSync } from "child_process";
import fs from "node:fs";
import path from "node:path";
import iconutil from "iconutil";
import plist from "plist";

import { AppData } from "../../utils/validators";
import { allApps } from "../../watchers/apps";

export async function getInstalledApps(
  directory = "/Applications",
): Promise<AppData[]> {
  const directoryContents = await getDirectoryContents(directory);
  const appsFileInfo = getAppsFileInfo(directoryContents);
  return (
    await Promise.all(
      appsFileInfo.map((appFileInfo) => getAppData(appFileInfo)),
    )
  ).filter(Boolean) as AppData[];
}

function getDirectoryContents(directory: string) {
  return new Promise<string[]>((resolve, reject) => {
    exec(`ls ${directory}`, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        try {
          resolve(getAppsSubDirectory(stdout, directory));
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

function getAppsSubDirectory(stdout: string, directory: string): string[] {
  let stdoutArr = stdout.split(/[(\r\n)\r\n]+/);
  stdoutArr = stdoutArr
    .filter((o) => o.endsWith(".app"))
    .map((i) => {
      return `${directory}/${i}`;
    });
  return stdoutArr;
}

function getAppsFileInfo(appsFile: readonly string[]) {
  const runMdlsShell = spawnSync("mdls", appsFile, {
    encoding: "utf8",
  });
  const stdoutData = runMdlsShell.stdout;
  const allAppsFileInfoList: string[][] = [];
  const stdoutDataArr = stdoutData.split(/[(\r\n)\r\n]+/);
  const splitIndexArr: number[] = [];
  for (let i = 0; i < stdoutDataArr.length; i++) {
    if (stdoutDataArr[i].includes("_kMDItemDisplayNameWithExtensions")) {
      splitIndexArr.push(i);
    }
  }
  for (let j = 0; j < splitIndexArr.length; j++) {
    allAppsFileInfoList.push([
      ...stdoutDataArr.slice(splitIndexArr[j], splitIndexArr[j + 1]),
      `_FILE_PATH = ${appsFile[j]}`,
    ]);
  }
  return allAppsFileInfoList;
}

async function getAppData(singleAppFileInfo: string[]) {
  const getKeyVal = (lineData: string) => {
    const lineDataArr = lineData.split("=");
    return {
      key: lineDataArr[0].trim().replace(/"/g, ""),
      value: lineDataArr[1] ? lineDataArr[1].trim().replace(/"/g, "") : "",
    };
  };

  const record = singleAppFileInfo.filter(Boolean).reduce(
    (acc, curr) => {
      const val = getKeyVal(curr);
      if (val.value) {
        acc[val.key] = val.value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const app = allApps.find((app) => {
    return (
      app.mac?.bundleId &&
      record["kMDItemCFBundleIdentifier"] === app.mac.bundleId
    );
  });

  const bundleId = app?.mac?.bundleId ?? record["kMDItemCFBundleIdentifier"];
  if (!bundleId) {
    return;
  }

  const execName = record["kMDItemDisplayName"];
  const name = execName?.replace(".app", "");
  if (!name) {
    return;
  }

  const filePath = record["_FILE_PATH"];
  if (!filePath) {
    return;
  }

  const icon = await getAppIcon(filePath);
  const version = record["kMDItemVersion"] || null;

  return {
    path: filePath,
    icon,
    name,
    bundleId,
    id: app?.id ?? bundleId,
    isBrowser: app?.isBrowser ?? false,
    isDefaultEnabled: app?.isDefaultEnabled ?? false,
    isElectronApp: app?.isElectronApp ?? false,
    version,
    execName: path.parse(filePath).base,
  } satisfies AppData;
}

async function getAppIcon(appPath: string) {
  let icnsPath: string | null = null;

  const getFirstIcnsFileFromResourcesDir = () => {
    return new Promise<string | null>((resolve, reject) => {
      exec(
        `ls ${path.join(appPath, "Contents/Resources")}`,
        (error, stdout) => {
          if (error) {
            reject(error);
          } else {
            try {
              const stdoutArr = stdout.split(/[(\r\n)\r\n]+/);
              const icnsFiles = stdoutArr.filter((file) =>
                file.trim().endsWith(".icns"),
              );

              if (icnsFiles.length > 0) {
                resolve(
                  path.join(appPath, "Contents/Resources", icnsFiles[0]!),
                );
              }
              resolve(null);
            } catch (err) {
              reject(err);
            }
          }
        },
      );
    });
  };

  try {
    const content = fs.readFileSync(path.join(appPath, "Contents/info.plist"), {
      encoding: "utf-8",
    });
    const info = plist.parse(content) as Record<string, string>;
    if (info["CFBundleIconFile"]) {
      let iconFileName = info["CFBundleIconFile"];
      if (!iconFileName.endsWith(".icns")) {
        iconFileName += ".icns";
      }
      icnsPath = path.join(appPath, "Contents/Resources", iconFileName);
    }
  } catch (_error) {
    /* empty */
  }

  if (!icnsPath) {
    try {
      icnsPath = await getFirstIcnsFileFromResourcesDir();
    } catch (_error) {
      /* empty */
    }
  }

  if (!icnsPath) {
    return null;
  }

  return parseIconFromIcnsFile(icnsPath);
}

async function parseIconFromIcnsFile(path: string) {
  function getSize(filename: string) {
    const match = filename.match(/(\d+)x(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  }

  return new Promise<string>((resolve, reject) => {
    iconutil.toIconset(path, function (err, icons) {
      if (err) {
        reject(err);
        return;
      }
      const sortedIcons = Object.entries(icons)
        .sort((a, b) => getSize(a[0]) - getSize(b[0]))
        .map((i) => i[1]);

      const icon = sortedIcons[sortedIcons.length - 1];
      resolve("data:image/png;base64," + icon.toString("base64"));
    });
  });
}
