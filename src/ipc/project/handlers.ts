import { os } from "@orpc/server";
import { dialog } from "electron";
import { createProject } from "@/utils/project-manager";
import { createProjectInputSchema } from "./schemas";

export const createNewProject = os
  .input(createProjectInputSchema)
  .handler(async ({ input }) => {
    const { apkPath } = input;
    return createProject(apkPath);
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
