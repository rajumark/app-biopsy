import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import { app } from "electron";
import https from "node:https";

const execAsync = promisify(exec);

export function getToolsPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, ".config", "Appbiopsy", "tools");
}

export function getToolsInfoPath(): string {
  return path.join(getToolsPath(), "tools_info.json");
}

export interface ToolsInfo {
  jadx_path?: string;
  jadx_status?: number; // 0 = pending, 1 = ready
  jre_path?: string;
  jre_status?: number;
}

export function getToolsInfo(): ToolsInfo {
  const infoPath = getToolsInfoPath();
  if (fs.existsSync(infoPath)) {
    try {
      const data = fs.readFileSync(infoPath, "utf-8");
      const parsed = JSON.parse(data) as ToolsInfo;
      return { jadx_status: 0, jre_status: 0, ...parsed };
    } catch (e) {
      console.error("Failed to parse tools_info.json", e);
    }
  }
  return { jadx_status: 0, jre_status: 0 };
}

export function saveToolsInfo(info: ToolsInfo) {
  const toolsPath = getToolsPath();
  if (!fs.existsSync(toolsPath)) {
    fs.mkdirSync(toolsPath, { recursive: true });
  }
  fs.writeFileSync(getToolsInfoPath(), JSON.stringify(info, null, 2));
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    // Handle redirect since it's github raw
    const request = (currentUrl: string) => {
      https.get(currentUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          return request(response.headers.location!);
        }

        if (response.statusCode !== 200) {
          fs.unlink(dest, () => {});
          return reject(new Error(`Failed to download: ${response.statusCode}`));
        }

        response.pipe(file);
        
        file.on("finish", () => {
          file.close();
          resolve();
        });
      }).on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

export async function downloadAndExtractJadx(): Promise<{ success: boolean; error?: string }> {
  try {
    const toolsPath = getToolsPath();
    const jadxDir = path.join(toolsPath, "jadx");
    
    if (!fs.existsSync(jadxDir)) {
      fs.mkdirSync(jadxDir, { recursive: true });
    }

    const zipPath = path.join(toolsPath, "jadx-1.5.5.zip");
    const downloadUrl = "https://github.com/rajumark/adbcontent/raw/main/jadx-1.5.5.zip";

    // 1. Download
    await downloadFile(downloadUrl, zipPath);

    // 2. Extract
    // Using unzip command which is typically available on Linux
    await execAsync(`unzip -o "${zipPath}" -d "${jadxDir}"`);

    // Delete zip after extraction
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    // Update tools_info.json
    const info = getToolsInfo();
    info.jadx_path = jadxDir;
    info.jadx_status = 1;
    saveToolsInfo(info);

    return { success: true };
  } catch (error) {
    console.error("Error downloading/extracting JADX:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function downloadAndExtractJre(): Promise<{ success: boolean; error?: string }> {
  try {
    const toolsPath = getToolsPath();
    const jreDir = path.join(toolsPath, "jre");
    
    if (!fs.existsSync(jreDir)) {
      fs.mkdirSync(jreDir, { recursive: true });
    }

    const platform = os.platform();
    const arch = os.arch();
    let jreFileName = '';

    if (platform === 'win32') {
      jreFileName = 'jre_windows_x64.zip';
    } else if (platform === 'darwin') {
      if (arch === 'arm64') {
        jreFileName = 'jre_mac_aarch64.tar.gz';
      } else {
        jreFileName = 'jre_mac_x64.tar.gz';
      }
    } else {
      jreFileName = 'jre_linux_x64.tar.gz';
    }

    const downloadPath = path.join(toolsPath, jreFileName);
    const downloadUrl = `https://github.com/rajumark/adbcontent/raw/main/jre/${jreFileName}`;

    // 1. Download
    await downloadFile(downloadUrl, downloadPath);

    // 2. Extract
    if (jreFileName.endsWith('.zip')) {
      await execAsync(`unzip -o "${downloadPath}" -d "${jreDir}"`);
    } else if (jreFileName.endsWith('.tar.gz')) {
      await execAsync(`tar -xzf "${downloadPath}" -C "${jreDir}"`);
    }

    // Delete archive after extraction
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }

    // Update tools_info.json
    const info = getToolsInfo();
    info.jre_path = jreDir;
    info.jre_status = 1;
    saveToolsInfo(info);

    return { success: true };
  } catch (error) {
    console.error("Error downloading/extracting JRE:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

