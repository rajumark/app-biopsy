import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import { app } from "electron";
import { getToolsPath, getProjectsPath } from "./app-data";
import https from "node:https";

const execAsync = promisify(exec);

// Already imported from app-data


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

export async function decompileApk(
  projectId: string
): Promise<{ success: boolean; logs?: string; error?: string }> {
  try {
    const info = getToolsInfo();

    if (!info.jadx_path || info.jadx_status !== 1) {
      return { success: false, error: "JADX is not installed. Please download it from Decompile Manager." };
    }
    if (!info.jre_path || info.jre_status !== 1) {
      return { success: false, error: "JRE is not installed. Please download it from Decompile Manager." };
    }

    const projectDir = path.join(getProjectsPath(), projectId);

    const apkPath = path.join(projectDir, "source_files", "local_app.apk");
    const outputDir = path.join(projectDir, "source_files", "decompiled");

    if (!fs.existsSync(apkPath)) {
      return { success: false, error: "APK file not found: " + apkPath };
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Resolve JRE home (one level inside jre dir)
    let jreHome = info.jre_path;
    const jreDirEntries = fs.readdirSync(jreHome);
    if (jreDirEntries.length > 0) {
      const firstEntry = path.join(jreHome, jreDirEntries[0]);
      if (fs.statSync(firstEntry).isDirectory()) {
        jreHome = firstEntry;
      }
    }

    // Mac-specific deeper resolution
    if (os.platform() === "darwin") {
      const macHome = path.join(jreHome, "Contents", "Home");
      if (fs.existsSync(macHome)) {
        jreHome = macHome;
      }
    }

    const jadxBin = path.join(info.jadx_path, "bin", "jadx");
    const javaBin = path.join(jreHome, "bin", "java");


    // Ensure executables are runnable
    if (fs.existsSync(jadxBin)) {
      fs.chmodSync(jadxBin, 0o755);
    }
    if (fs.existsSync(javaBin)) {
      fs.chmodSync(javaBin, 0o755);
    }

    const { stdout, stderr } = await execAsync(
      `"${jadxBin}" -d "${outputDir}" "${apkPath}"`,
      { env: { ...process.env, JAVA_HOME: jreHome } }
    );

    const logs = [stdout, stderr].filter(Boolean).join("\n").trim();
    return { success: true, logs };
  } catch (error: any) {
    console.error("Error decompiling APK:", error);
    const logs = [error?.stdout, error?.stderr].filter(Boolean).join("\n").trim();
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage, logs };
  }
}
