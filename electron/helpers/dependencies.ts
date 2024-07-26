import { exec } from "node:child_process";
import fs, { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { addHours, getUnixTime, isAfter } from "date-fns";
import fetch from "node-fetch";
import unzpier from "unzipper";
import { z } from "zod";

import { ConfigFile } from "./config-file";
import { Logger } from "./logger";

const streamPipeline = promisify(pipeline);

export class Dependencies {
  private logger: Logger;
  private configFile: ConfigFile;

  constructor(logger: Logger, configFile: ConfigFile) {
    this.logger = logger;
    this.configFile = configFile;
  }

  async installDependencies() {
    try {
      if (!(await this.isCLILatest())) {
        await this.downloadCLI();
      }
    } catch (error) {
      this.logger.error(`Failed to install dependencies: ${error}`);
    }
  }

  private getCLIPath() {
    const ext = process.platform === "win32" ? ".exe" : "";
    const arch = this.getArch();
    const platfrom = this.getPlatfrom();
    return path.join(
      this.configFile.resourcesFolder,
      `wakatime-cli-${platfrom}-${arch}${ext}`,
    );
  }

  private async getLatestCLIVersion(): Promise<string | null> {
    const lastModified = this.configFile.getSettings(
      "internal",
      "cli_version_last_modified",
      true,
    );
    const currentVersion = this.configFile.getSettings(
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
    const data = await res.json();

    const now = getUnixTime(new Date());
    this.configFile.setSettings(
      "internal",
      "cli_version_last_accessed",
      String(now),
      true,
    );

    if (res.status === 304) {
      // Current version is still the latest version available
      return currentVersion;
    } else if (
      lastModified &&
      lastModified === res.headers.get("Last-Modified")
    ) {
      const release = z.object({ tag_name: z.string() }).parse(data);
      this.configFile.setSettings(
        "internal",
        "cli_version_last_modified",
        lastModified,
        true,
      );
      this.configFile.setSettings(
        "internal",
        "cli_version",
        release.tag_name,
        true,
      );
      return release.tag_name;
    }

    return null;
  }

  private async isCLILatest(): Promise<boolean> {
    const cli = this.getCLIPath();

    if (!fs.existsSync(cli)) {
      return false;
    }

    const output = await new Promise<string>((resolve, reject) => {
      exec(`${cli} --version`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }

        resolve(stdout);
      });
    });

    // disable updating wakatime-cli when it was built from source
    if (output.trim() === "<local-build>") {
      return true;
    }

    let version: string | null = null;

    const regex = /([0-9]+\.[0-9]+\.[0-9]+)/;
    const match = output.match(regex);
    if (match?.length) {
      version = match[0];
    }

    const accessed = this.configFile.getSettings(
      "internal",
      "cli_version_last_accessed",
      true,
    );
    if (accessed && isAfter(new Date(), addHours(new Date(accessed), 4))) {
      this.logger.info(
        "Skip checking for wakatime-cli updates because recently checked (now - accessed) seconds ago",
      );
      return true;
    }

    const remoteVersion = await this.getLatestCLIVersion();
    if (!remoteVersion) {
      return true;
    }

    if (version === remoteVersion || `v${version}` === remoteVersion) {
      return true;
    }

    return true;
  }

  private async downloadCLI() {
    const arch = this.getArch();
    const platfrom = this.getPlatfrom();

    const url = `https://github.com/wakatime/wakatime-cli/releases/latest/download/wakatime-cli-${platfrom}-${arch}.zip`;
    const zipFile = path.join(
      this.configFile.resourcesFolder,
      "wakatime-cli.zip",
    );
    const cli = this.getCLIPath();

    if (fs.existsSync(zipFile)) {
      try {
        fs.rmSync(zipFile);
      } catch (error) {
        console.error(error);
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
        console.error(error);
      }
    }

    await new Promise((resolve, reject) => {
      fs.createReadStream(zipFile)
        .pipe(unzpier.Extract({ path: this.configFile.resourcesFolder }))
        .on("close", resolve)
        .on("error", reject);
    });
    // remove the downloaded zip file
    fs.rmSync(zipFile);

    if (!fs.existsSync(cli)) {
      throw new Error(`${cli} file not found!`);
    }
  }

  private getArch() {
    return process.arch.indexOf("arm") !== -1
      ? "arm64"
      : process.arch.indexOf("64")
        ? "amd64"
        : process.arch.indexOf("32")
          ? "386"
          : process.arch;
  }

  private getPlatfrom() {
    return process.platform === "win32" ? "windows" : process.platform;
  }
}
