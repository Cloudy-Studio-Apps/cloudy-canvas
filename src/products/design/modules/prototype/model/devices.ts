import { WIDE_SCREEN_WIDTH } from "../prototype.constants";
import type { PrototypeFlowDevice, PrototypePlatform } from "./flow.types";

/** Each platform's devices, the first its default (their labels are in the module's i18n). */
export const PROTOTYPE_DEVICES: Record<PrototypePlatform, readonly string[]> = {
  mobile: ["iphone-16", "iphone-se", "pixel-9"],
  tablet: ["ipad-air", "galaxy-tab"],
  desktop: ["window-mac", "window-windows", "window-linux"],
  web: ["browser-1280", "browser-1440", "browser-fit"],
};

/** A platform's default device (its first). */
export function firstDevice(platform: PrototypePlatform): string {
  return PROTOTYPE_DEVICES[platform][0] ?? "";
}

/** The device a new flow starting at `screen` plays on: a browser when it's wide, else a phone. */
export function defaultFlowDevice(screen: { w: number }): PrototypeFlowDevice {
  const platform: PrototypePlatform = screen.w > WIDE_SCREEN_WIDTH ? "web" : "mobile";
  return { platform, device: firstDevice(platform) };
}
