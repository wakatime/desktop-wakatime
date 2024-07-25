import { exec } from "node:child_process";
import fs, { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fetch from "node-fetch";
import unzpier from "unzipper";

import { Config } from "./config";
import { Logger } from "./logger";

const streamPipeline = promisify(pipeline);

export class Dependencies {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
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
    const resourcesPath = Config.getResourcesPath();
    const ext = process.platform === "win32" ? ".exe" : "";
    const arch = this.getArch();
    const platfrom = this.getPlatfrom();
    return path.join(resourcesPath, `wakatime-cli-${platfrom}-${arch}${ext}`);
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

    console.log(version);

    return true;
  }

  private async downloadCLI() {
    const resourcesPath = Config.getResourcesPath();

    const arch = this.getArch();
    const platfrom = this.getPlatfrom();

    const url = `https://github.com/wakatime/wakatime-cli/releases/latest/download/wakatime-cli-${platfrom}-${arch}.zip`;
    const zipFile = path.join(resourcesPath, "wakatime-cli.zip");
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
        .pipe(unzpier.Extract({ path: resourcesPath }))
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
