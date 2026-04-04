import { copyFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from "node:fs";
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
  apkSourcePath: string,
  projectName: string
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

    // Create project_info.json
    const projectInfoPath = path.join(projectFolderPath, "project_info.json");
    const projectInfo = {
      projection_creation_time: new Date().toISOString(),
      apk_name: apkFileName,
      apk_path: apkDestinationPath,
      project_id: projectId,
      jadx_decompile_status: 0,
      project_name: projectName
    };
    writeFileSync(projectInfoPath, JSON.stringify(projectInfo, null, 2));

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

export interface ProjectInfo {
  projection_creation_time: string;
  apk_name: string;
  apk_path: string;
  project_id: string;
  jadx_decompile_status: number;
  project_name: string;
}

export function getProjects(): ProjectInfo[] {
  try {
    const projectsPath = getProjectsPath();
    if (!existsSync(projectsPath)) return [];
    
    const projectDirs = readdirSync(projectsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith("project_"))
      .map(dirent => dirent.name);

    const projects: ProjectInfo[] = [];

    for (const dirName of projectDirs) {
      const infoPath = path.join(projectsPath, dirName, "project_info.json");
      if (existsSync(infoPath)) {
        try {
          const data = readFileSync(infoPath, "utf-8");
          const parsed = JSON.parse(data) as ProjectInfo;
          projects.push({ ...parsed, project_id: dirName }); // Ensure project_id matches folder just in case
        } catch (err) {
          console.error("Failed to parse project_info.json for", dirName, err);
        }
      }
    }

    // Sort by creation time descending usually makes sense, but we'll just return as is
    return projects;
  } catch (error) {
    console.error("Error getting projects:", error);
    return [];
  }
}

export function deleteProject(projectId: string): { success: boolean; error?: string } {
  try {
    const projectsPath = getProjectsPath();
    const projectFolderPath = path.join(projectsPath, projectId);
    
    if (existsSync(projectFolderPath)) {
      rmSync(projectFolderPath, { recursive: true, force: true });
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
