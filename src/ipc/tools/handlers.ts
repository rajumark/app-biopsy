import { os } from "@orpc/server";
import { getToolsInfo, downloadAndExtractJadx, downloadAndExtractJre } from "@/utils/tools-manager";

export const getToolsStatus = os.handler(async () => {
  return getToolsInfo();
});

export const downloadJadx = os.handler(async () => {
  return downloadAndExtractJadx();
});

export const downloadJre = os.handler(async () => {
  return downloadAndExtractJre();
});
