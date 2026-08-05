import { UAParser } from "ua-parser-js";
import type { DeviceType } from "@/lib/analytics/types";

export type ParsedUserAgent = {
  browser: string;
  os: string;
  device: DeviceType;
};

export function parseUserAgent(uaHeader: string | null): ParsedUserAgent {
  if (!uaHeader) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }

  const parser = new UAParser(uaHeader);
  const result = parser.getResult();

  const browser = result.browser.name?.trim() || "Unknown";
  const os = result.os.name?.trim() || "Unknown";

  const deviceType = result.device.type;
  let device: DeviceType = "Desktop";
  if (deviceType === "mobile") device = "Mobile";
  else if (deviceType === "tablet") device = "Tablet";
  else if (!result.device.type && /Mobile|Android|iPhone/i.test(uaHeader)) {
    device = "Mobile";
  }

  return { browser, os, device };
}
