import { exec, spawnSync } from "child_process";
import plist from "plist";
import fs from "node:fs";
import path from "node:path";
import type { AppDataMac } from "~/types/app-data";
import iconutil from "iconutil";

export async function getInstalledAppsMac(
  directory = "/Applications",
): Promise<AppDataMac[]> {
  const directoryContents = await getDirectoryContents(directory);
  const appsFileInfo = await getAppsFileInfo(directoryContents);
  const appDatas = appsFileInfo
    .map((appFileInfo) => getAppData(appFileInfo))
    .filter((app) => app.uniqueId);
  const appsWithIcon = await Promise.all(
    appDatas.map<Promise<AppDataMac>>(async (appData) => {
      let appIcon: string | null = null;
      try {
        appIcon = await getAppIcon(appData["_FILE_PATH"]!);
      } catch (error) {
        /* empty */
      }
      return {
        ...appData,
        appIcon,
      };
    }),
  );
  return appsWithIcon;
}

export function getDirectoryContents(directory: string) {
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

export function getAppsSubDirectory(
  stdout: string,
  directory: string,
): string[] {
  let stdoutArr = stdout.split(/[(\r\n)\r\n]+/);
  stdoutArr = stdoutArr
    .filter((o) => o.endsWith(".app"))
    .map((i) => {
      return `${directory}/${i}`;
    });
  return stdoutArr;
}

export function getAppsFileInfo(appsFile: readonly string[]) {
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

export function getAppData(singleAppFileInfo: string[]) {
  const getKeyVal = (lineData: string) => {
    const lineDataArr = lineData.split("=");
    return {
      key: lineDataArr[0].trim().replace(/"/g, ""),
      value: lineDataArr[1] ? lineDataArr[1].trim().replace(/"/g, "") : "",
    };
  };

  const getAppInfoData = (appArr: string[]) => {
    const appData: AppDataMac = {
      uniqueId: "",
      type: "mac",
    };

    appArr.filter(Boolean).forEach((o) => {
      const appKeyVal = getKeyVal(o);
      if (appKeyVal.value) {
        appData[appKeyVal.key] = appKeyVal.value;
      }
      if (appKeyVal.key === "kMDItemDisplayName") {
        appData.appName = appKeyVal.value.replace(".app", "");
      }
      if (appKeyVal.key === "kMDItemVersion") {
        appData.appVersion = appKeyVal.value;
      }
      if (appKeyVal.key === "kMDItemDateAdded") {
        appData.appInstallDate = appKeyVal.value;
      }
      if (appKeyVal.key === "kMDItemCFBundleIdentifier") {
        appData.uniqueId = appKeyVal.value;
        appData.appIdentifier = appKeyVal.value;
      }
      if (appKeyVal.key === "kMDItemAppStoreCategory") {
        appData.appCategory = appKeyVal.value;
      }
      if (appKeyVal.key === "kMDItemAppStoreCategoryType") {
        appData.appCategoryType = appKeyVal.value;
      }
    });
    return appData;
  };
  return getAppInfoData(singleAppFileInfo);
}

export async function getAppIcon(appPath: string) {
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
  } catch (error) {
    /* empty */
  }

  if (!icnsPath) {
    try {
      icnsPath = await getFirstIcnsFileFromResourcesDir();
    } catch (error) {
      /* empty */
    }
  }

  if (!icnsPath) {
    return null;
  }

  return parseIconFromIcnsFile(icnsPath);
}

export async function parseIconFromIcnsFile(path: string) {
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
