import type { Size } from "@canvas";

import type { PrototypePlatform } from "../../model";

/** The most a device is enlarged to fill the stage. */
const MAX_SCALE = 2.4;
/** The room kept round the device on the stage, across and down (CSS pixels). */
const MARGIN = { w: 80, h: 60 };
/** The device body round the screen (the bezel, or the window's border), across and down. */
const BODY: Record<PrototypePlatform, number> = { mobile: 24, tablet: 36, desktop: 2, web: 2 };
/** A window's title bar or a browser's address bar. */
const CHROME_HEIGHT = 32;

/** CSS pixels per world unit that fit a device of screen size `device` in the stage, at most 2.4. */
export function fitScale(stage: Size, device: Size, platform: PrototypePlatform): number {
  const chrome = platform === "desktop" || platform === "web" ? CHROME_HEIGHT : 0;
  const body = BODY[platform];
  const scale = Math.min(
    MAX_SCALE,
    (stage.w - MARGIN.w - body) / device.w,
    (stage.h - MARGIN.h - body - chrome) / device.h,
  );
  return Math.max(0, scale);
}
