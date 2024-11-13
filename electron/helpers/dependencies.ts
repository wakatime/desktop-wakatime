import { LogLevel, Logging } from "../utils/logging";
import {
  addHours,
  formatDistanceToNow,
  getUnixTime,
  interval,
  intervalToDuration,
  isBefore,
} from "date-fns";
import {
  exec,
  getArch,
  getCLIPath,
  getPlatfrom,
  getResourcesFolderPath,
  parseJSONObject,
} from "../utils";
import fs, { createWriteStream } from "node:fs";

import { ConfigFile } from "./config-file";
import fetch from "node-fetch";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import unzpier from "unzipper";
import { z } from "zod";

const streamPipeline = promisify(pipeline);

type UserAgent = {
  editor: string | null;
  is_browser_extension: boolean;
  last_seen_at: string | null;
};

export abstract class Dependencies {
  static installDependencies() {
    (async () => {
      try {
        const isLatest = await this.isCLILatest();
        if (!isLatest) {
          await this.downloadCLI();
        }
      } catch (error) {
        Logging.instance().log(
          `Failed to install dependencies: ${error}`,
          LogLevel.ERROR,
          true,
        );
      }
    })();
  }

  static async recentBrowserExtension() {
    const apiKey = ConfigFile.getSetting("settings", "api_key");
    if (!apiKey) {
      return null;
    }
    try {
      const url = `https://api.wakatime.com/api/v1/users/current/user_agents?api_key=${apiKey}`;
      const res = await fetch(url);
      if (res.status !== 200) {
        throw res.statusText;
      }
      const text = await res.text();
      const release = parseJSONObject(text) as { data: UserAgent[] };
      const now = new Date();

      for (const agent of release.data) {
        if (agent.is_browser_extension && agent.last_seen_at && agent.editor) {
          const timeInterval = intervalToDuration(
            interval(new Date(agent.last_seen_at), now),
          ).seconds;
          if (!!timeInterval && timeInterval > 600) {
            break;
          }
          return agent.editor;
        }
      }
    } catch (error) {
      Logging.instance().log(
        `Request error checking for conflicting browser extension: ${error}`,
        LogLevel.ERROR,
      );
    }
    return null;
  }

  private static async getLatestCLIVersion(): Promise<string | null> {
    const lastModified = ConfigFile.getSetting(
      "internal",
      "cli_version_last_modified",
      true,
    );
    const currentVersion = ConfigFile.getSetting(
      "internal",
      "cli_version",
      true,
    );

    const apiUrl =
      "https://api.github.com/repos/wakatime/wakatime-cli/releases/latest";
    const headers = new Headers();

    if (lastModified && currentVersion) {
      headers.set("If-Modified-Since", lastModified);
    }

    const res = await fetch(apiUrl, {
      headers,
    });

    const text = await res.text();
    const data = parseJSONObject(text);

    const now = getUnixTime(new Date());
    ConfigFile.setSetting(
      "internal",
      "cli_version_last_accessed",
      String(now),
      true,
    );
    if (res.status === 304) {
      // Current version is still the latest version available
      Logging.instance().log(`Latest wakatime-cli release: ${currentVersion}`);
      return currentVersion;
    } else if (res.headers.get("Last-Modified")) {
      const release = z.object({ tag_name: z.string() }).safeParse(data);
      if (!release.success) {
        Logging.instance().log(
          `Failed to parse latest release: ${release.error}`,
          LogLevel.ERROR,
          true,
        );
        return null;
      }
      Logging.instance().log(
        `Latest wakatime-cli release: ${release.data.tag_name}`,
      );
      ConfigFile.setSetting(
        "internal",
        "cli_version_last_modified",
        res.headers.get("Last-Modified")!,
        true,
      );
      ConfigFile.setSetting(
        "internal",
        "cli_version",
        release.data.tag_name,
        true,
      );
      return release.data.tag_name;
    } else {
      return null;
    }
  }

  private static async isCLILatest(): Promise<boolean> {
    const cli = getCLIPath();

    if (!fs.existsSync(cli)) {
      return false;
    }

    const [output, err] = await exec(cli, "--version");
    if (err) {
      Logging.instance().log(`Error 1: ${err}`, LogLevel.ERROR);
    }

    // disable updating wakatime-cli when it was built from source
    if (output === "<local-build>") {
      return true;
    }

    let version: string | null = null;

    const regex = /([0-9]+\.[0-9]+\.[0-9]+)/;
    const match = output.match(regex);
    if (match?.length) {
      version = match[0];
    }

    const accessed = ConfigFile.getSetting(
      "internal",
      "cli_version_last_accessed",
      true,
    );
    const accessedDate = accessed ? new Date(Number(accessed) * 1000) : null;
    if (accessedDate && isBefore(new Date(), addHours(accessedDate, 4))) {
      Logging.instance().log(
        `Skip checking for wakatime-cli updates because recently checked ${formatDistanceToNow(accessedDate, { addSuffix: true })}`,
      );
      return true;
    }

    const remoteVersion = await this.getLatestCLIVersion();
    if (!remoteVersion) {
      return true;
    }

    if (version && `v${version}` === remoteVersion) {
      return true;
    } else {
      return false;
    }
  }

  private static async downloadCLI() {
    const url = `https://github.com/wakatime/wakatime-cli/releases/latest/download/wakatime-cli-${getPlatfrom()}-${getArch()}.zip`;
    const zipFile = path.join(getResourcesFolderPath(), "wakatime-cli.zip");
    const cli = getCLIPath();

    if (fs.existsSync(zipFile)) {
      try {
        fs.rmSync(zipFile);
      } catch (error) {
        Logging.instance().log(
          `Failed to remove file: ${zipFile}. Error: ${error}`,
          LogLevel.ERROR,
          true,
        );
      }
    }

    // Download zip file
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`unexpected response ${response.statusText}`);
    }

    const writeStream = createWriteStream(zipFile);
    await streamPipeline(response.body, writeStream);
    writeStream.close();

    // Unzip downloaded zip file
    if (fs.existsSync(cli)) {
      try {
        fs.rmSync(cli);
      } catch (error) {
        Logging.instance().log(
          `Failed to remove file: ${cli}. Error: ${error}`,
          LogLevel.ERROR,
        );
      }
    }

    if (process.platform === "win32") {
      const directory = await unzpier.Open.file(zipFile);
      await directory.extract({ path: getResourcesFolderPath() });
    } else if (process.platform === "darwin") {
      await exec("/usr/bin/unzip", zipFile, "-d", getResourcesFolderPath());
    }

    // remove the downloaded zip file
    fs.rmSync(zipFile);

    if (!fs.existsSync(cli)) {
      throw new Error(`${cli} file not found!`);
    }
  }

  static async reportError(
    error: Error,
    origin: string,
    versionString: string,
  ) {
    try {
      const url = "https://api.wakatime.com/api/v1/errors/javascript";
      const apiKey = ConfigFile.getSetting("settings", "api_key");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": `desktop-wakatime ${versionString}`,
      };
      if (apiKey) {
        headers["Authorization"] = `Basic ${apiKey}`;
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          browser_url: `desktop-wakatime://${versionString}`,
          script_url: origin,
          message: error.message,
          traceback: error.stack,
          line: (error as unknown as { lineNumber: number }).lineNumber,
          column: (error as unknown as { columnNumber: number }).columnNumber,
        }),
      });
      if (!resp.ok) {
        Logging.instance().log(await resp.text(), LogLevel.WARN);
      }
    } catch (err) {
      Logging.instance().log(`reportError failed: ${err}`, LogLevel.ERROR);
    }
  }
}
