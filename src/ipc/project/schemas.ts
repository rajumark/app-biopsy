import { z } from "zod";

export const createProjectInputSchema = z.object({
  apkPath: z.string(),
  projectName: z.string(),
});

export const deleteProjectInputSchema = z.object({
  projectId: z.string(),
});
