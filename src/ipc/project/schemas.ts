import { z } from "zod";

export const createProjectInputSchema = z.object({
  apkPath: z.string(),
  projectName: z.string(),
});

export const deleteProjectInputSchema = z.object({
  projectId: z.string(),
});

export const setDefaultProjectInputSchema = z.object({
  projectId: z.string(),
});

export const fetchFileTreeInputSchema = z.object({
  projectId: z.string(),
});

export const readFileContentInputSchema = z.object({
  path: z.string(),
});
