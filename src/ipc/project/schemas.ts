import { z } from "zod";

export const createProjectInputSchema = z.object({
  apkPath: z.string(),
});
