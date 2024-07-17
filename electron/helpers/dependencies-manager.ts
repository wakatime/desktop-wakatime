import fs, { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fetch from "node-fetch";
import unzpier from "unzipper";

import { Config } from "./config";

const streamPipeline = promisify(pipeline);

export class DependenciesManager {
  static async installDependencies() {
    try {
      console.log("Installing Dependencies");
      if (!(await this.isCLILatest())) {
        await this.downloadCLI();
      }
      console.log("Installing dependencies complete");
    } catch (error) {
      console.log("Failed to install dependencies", error);
    }
  }

  static async isCLILatest(): Promise<boolean> {
    // TODO: Check if the currently installed cli is latest or not.
    const resourcesPath = Config.getResourcesPath();
    const cli = path.join(resourcesPath, "wakatime-cli");
    return fs.existsSync(cli);
  }

  static async downloadCLI() {
    console.log("Downloading CLI");
    const resourcesPath = Config.getResourcesPath();

    const fileName = this.getFileName();
    if (!fileName) {
      throw new Error("invalid arcitecture or platform!");
    }

    const url = `https://github.com/wakatime/wakatime-cli/releases/latest/download/${fileName}.zip`;
    const zipFile = path.join(resourcesPath, "wakatime-cli.zip");
    const cli = path.join(resourcesPath, "wakatime-cli");
    let cliReal: string;
    if (process.platform === "win32") {
      cliReal = path.join(resourcesPath, `${fileName}.exe`);
    } else {
      cliReal = path.join(resourcesPath, fileName);
    }

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
    if (fs.existsSync(cliReal)) {
      try {
        fs.rmSync(cliReal);
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

    if (fs.existsSync(cliReal)) {
      // Link cli to cliReal
      if (fs.existsSync(cli)) {
        fs.rmSync(cli);
      }
      fs.copyFileSync(cliReal, cli);
      fs.rmSync(cliReal);
    }

    console.log("CLI download complete");
  }

  static getFileName() {
    let arcitecture: "amd64" | "arm64" | null = null;
    if (process.arch === "arm64") {
      arcitecture = "arm64";
    } else if (process.arch === "x64") {
      arcitecture = "amd64";
    }

    if (arcitecture) {
      if (process.platform === "darwin") {
        return `wakatime-cli-darwin-${arcitecture}`;
      } else if (process.platform === "win32") {
        return `wakatime-cli-windows-${arcitecture}`;
      } else if (process.platform === "linux") {
        return `wakatime-cli-linux-${arcitecture}`;
      }
    }
    return null;
  }
}
