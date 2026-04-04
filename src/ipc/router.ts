import { app } from "./app";
import { createNewProject, selectApkFile, getProjectList, deleteExistingProject, getDefaultProjectHandler, setDefaultProjectHandler } from "./project";
import { shell } from "./shell";
import { theme } from "./theme";
import { window } from "./window";
import { getToolsStatus, downloadJadx, downloadJre, decompileApkHandler } from "./tools";

export const router = {
  theme,
  window,
  app,
  shell,
  project: {
    createNewProject,
    selectApkFile,
    getProjectList,
    deleteExistingProject,
    getDefaultProjectHandler,
    setDefaultProjectHandler,
  },
  tools: {
    getToolsStatus,
    downloadJadx,
    downloadJre,
    decompileApk: decompileApkHandler,
  }
};
