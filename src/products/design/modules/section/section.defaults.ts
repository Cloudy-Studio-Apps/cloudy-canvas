import type { SectionDefaults } from "./section.types";

export const SECTION_DEFAULTS = {
  size: { w: 600, h: 400 },
  fill: "#F3F4F6",
  radius: 6,
  title: {
    fontSize: 14,
    color: "#1F2937",
    background: "#FFFFFF",
    border: "#E5E7EB",
    padX: 8,
    padY: 4,
    inset: 8,
    radius: 4,
  },
} as const satisfies SectionDefaults;
