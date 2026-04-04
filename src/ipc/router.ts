import { app } from "./app";
import { createNewProject, selectApkFile, getProjectList, deleteExistingProject, getDefaultProjectHandler, setDefaultProjectHandler } from "./project";
import { shell } from "./shell";
import { theme } from "./theme";
import { window } from "./window";

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
};
