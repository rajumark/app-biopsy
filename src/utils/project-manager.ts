import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { getProjectsPath } from "./app-data";

/**
 * Generate a unique project ID with prefix
 * Format: project_[16 alphanumeric characters]
 */
export function generateProjectId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `project_${result}`;
}

/**
 * Create a new project folder and copy APK file
 */
export function createProject(
  apkSourcePath: string
): { success: boolean; projectId?: string; error?: string } {
  try {
    const projectId = generateProjectId();
    const projectsPath = getProjectsPath();
    const projectFolderPath = path.join(projectsPath, projectId);
    const sourceFilesPath = path.join(projectFolderPath, "source_files");

    // Create project folder
    if (!existsSync(projectFolderPath)) {
      mkdirSync(projectFolderPath, { recursive: true });
    }

    // Create source_files folder
    if (!existsSync(sourceFilesPath)) {
      mkdirSync(sourceFilesPath, { recursive: true });
    }

    // Copy APK file to source_files folder
    const apkFileName = path.basename(apkSourcePath);
    const apkDestinationPath = path.join(sourceFilesPath, apkFileName);
    
    copyFileSync(apkSourcePath, apkDestinationPath);

    return { 
      success: true, 
      projectId 
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
