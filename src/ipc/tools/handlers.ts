import { os } from "@orpc/server";
import { getToolsInfo, downloadAndExtractJadx } from "@/utils/tools-manager";

export const getToolsStatus = os.handler(async () => {
  return getToolsInfo();
});

export const downloadJadx = os.handler(async () => {
  return downloadAndExtractJadx();
});
