import { os } from "@orpc/server";
import { dialog } from "electron";
import { createProject, getProjects, deleteProject } from "@/utils/project-manager";
import { createProjectInputSchema, deleteProjectInputSchema } from "./schemas";

export const createNewProject = os
  .input(createProjectInputSchema)
  .handler(async ({ input }) => {
    const { apkPath, projectName } = input;
    return createProject(apkPath, projectName);
  });

export const getProjectList = os.handler(async () => {
  return getProjects();
});

export const deleteExistingProject = os
  .input(deleteProjectInputSchema)
  .handler(async ({ input }) => {
    const { projectId } = input;
    return deleteProject(projectId);
  });

export const selectApkFile = os.handler(async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Android APK Files", extensions: ["apk"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, error: "No file selected" };
  }

  return {
    success: true,
    filePath: result.filePaths[0],
  };
});
