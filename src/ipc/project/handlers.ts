import { os } from "@orpc/server";
import { dialog } from "electron";
import { createProject, getProjects, deleteProject, getDefaultProject, setDefaultProject, getFileTree, getFileContents } from "@/utils/project-manager";
import { createProjectInputSchema, deleteProjectInputSchema, setDefaultProjectInputSchema, fetchFileTreeInputSchema, readFileContentInputSchema } from "./schemas";

export const createNewProject = os
  .input(createProjectInputSchema)
  .handler(async ({ input }) => {
    const { apkPath, projectName } = input;
    return createProject(apkPath, projectName);
  });

export const getProjectList = os.handler(async () => {
  return getProjects();
});

export const getDefaultProjectHandler = os.handler(async () => {
  return getDefaultProject();
});

export const setDefaultProjectHandler = os
  .input(setDefaultProjectInputSchema)
  .handler(async ({ input }) => {
    const { projectId } = input;
    return setDefaultProject(projectId);
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

export const fetchFileTree = os
  .input(fetchFileTreeInputSchema)
  .handler(async ({ input }) => {
    const { projectId } = input;
    return getFileTree(projectId);
  });

export const readFileContent = os
  .input(readFileContentInputSchema)
  .handler(async ({ input }) => {
    const { path: filePath } = input;
    return getFileContents(filePath);
  });
