import { app } from 'electron';
import path from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

/**
 * Get the user data path for the application
 * Returns platform-specific paths:
 * - Windows: %APPDATA%/appbiopsy/
 * - macOS: ~/Library/Application Support/appbiopsy/
 * - Linux: ~/.config/appbiopsy/
 */
export function getUserDataPath(): string {
  return app.getPath('userData');
}

/**
 * Get the projects directory path within user data
 */
export function getProjectsPath(): string {
  return path.join(getUserDataPath(), 'projects');
}

/**
 * Get the tools directory path within user data
 */
export function getToolsPath(): string {
  return path.join(getUserDataPath(), 'tools');
}


/**
 * Initialize app data directories
 * Creates the user data folder and projects subfolder if they don't exist
 */
export function initializeAppDirectories(): void {
  try {
    const userDataPath = getUserDataPath();
    const projectsPath = getProjectsPath();

    // Create user data directory if it doesn't exist
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true });
      console.log(`Created user data directory: ${userDataPath}`);
    }

    // Create projects directory if it doesn't exist
    if (!existsSync(projectsPath)) {
      mkdirSync(projectsPath, { recursive: true });
      console.log(`Created projects directory: ${projectsPath}`);
    }

    const toolsPath = getToolsPath();
    // Create tools directory if it doesn't exist
    if (!existsSync(toolsPath)) {
      mkdirSync(toolsPath, { recursive: true });
      console.log(`Created tools directory: ${toolsPath}`);
    }


    console.log('App directories initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app directories:', error);
    throw error;
  }
}

/**
 * Check if app directories exist
 */
export function checkAppDirectories(): { userDataExists: boolean; projectsExists: boolean } {
  const userDataPath = getUserDataPath();
  const projectsPath = getProjectsPath();

  return {
    userDataExists: existsSync(userDataPath),
    projectsExists: existsSync(projectsPath),
  };
}
