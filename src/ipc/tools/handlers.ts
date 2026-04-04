import { os } from "@orpc/server";
import { z } from "zod";
import { getToolsInfo, downloadAndExtractJadx, downloadAndExtractJre, decompileApk } from "@/utils/tools-manager";

export const getToolsStatus = os.handler(async () => {
  return getToolsInfo();
});

export const downloadJadx = os.handler(async () => {
  return downloadAndExtractJadx();
});

export const downloadJre = os.handler(async () => {
  return downloadAndExtractJre();
});

export const decompileApkHandler = os
  .input(z.object({ projectId: z.string() }))
  .handler(async ({ input }) => {
    return decompileApk(input.projectId);
  });
