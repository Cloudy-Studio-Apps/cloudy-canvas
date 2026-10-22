import type { Size } from "@canvas";

import { FRAME_DEFAULTS } from "./frame.defaults";
import type { FramePreset } from "./frame.types";

/** Sizes the frame tool and the frame section offer. */
export const FRAME_PRESETS: readonly FramePreset[] = [
  { id: "desktop", label: "Desktop", group: "Desktop", size: { w: 1440, h: 1024 } },
  { id: "macbook", label: "MacBook Air", group: "Desktop", size: { w: 1280, h: 832 } },
  { id: "tablet", label: "Tablet", group: "Tablet", size: { w: 768, h: 1024 } },
  { id: "phone", label: "Phone", group: "Phone", size: { w: 393, h: 852 } },
  { id: "android", label: "Android", group: "Phone", size: { w: 412, h: 917 } },
  { id: "a4", label: "A4", group: "Paper", size: { w: 595, h: 842 } },
  { id: "post", label: "Social post", group: "Social", size: { w: 1080, h: 1080 } },
  { id: "story", label: "Social story", group: "Social", size: { w: 1080, h: 1920 } },
];

/** The size a click with the frame tool places for a preset id (a small square for unknown ids). */
export function presetSize(id: string): Size {
  return FRAME_PRESETS.find((preset) => preset.id === id)?.size ?? FRAME_DEFAULTS.size;
}
