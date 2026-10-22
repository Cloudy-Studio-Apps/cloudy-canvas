import type { FrameDefaults } from "./frame.types";

export const FRAME_DEFAULTS = {
  size: { w: 100, h: 100 },
  fill: "#FFFFFF",
  cornerRadius: 0,
  clipsContent: true,
  label: { fontSize: 12, gap: 4, color: "#6B7280" },
} as const satisfies FrameDefaults;
