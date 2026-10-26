import { clamp, mod } from "@canvas";

import type { Hsv } from "../color";
import type { Harmony, HarmonyId } from "./harmony.types";

export const HARMONIES: readonly Harmony[] = [
  { id: "analogous", label: "Analogous", offsets: [0, -30, 30, -60, 60] },
  { id: "monochromatic", label: "Mono", offsets: [0] },
  { id: "complementary", label: "Complement", offsets: [0, 180] },
  { id: "split", label: "Split", offsets: [0, 150, 210] },
  { id: "triad", label: "Triad", offsets: [0, 120, 240] },
  { id: "square", label: "Square", offsets: [0, 90, 180, 270] },
  { id: "compound", label: "Compound", offsets: [0, 30, 180, 210] },
  { id: "shades", label: "Shades", offsets: [0] },
  { id: "custom", label: "Custom", offsets: null },
];

/** Each round past the harmony's hues: less saturated and lighter, then darker, … */
const VARIANTS: readonly { s: number; v: number }[] = [
  { s: 0, v: 0 },
  { s: -0.25, v: 0.12 },
  { s: 0.1, v: -0.3 },
  { s: -0.45, v: 0.2 },
];

/** `n` colors in a harmony around `base` (custom is treated as complementary). */
export function harmonize(base: Hsv, harmony: HarmonyId, n: number): Hsv[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    if (harmony === "monochromatic") {
      return {
        h: base.h,
        s: clamp(base.s * (1 - 0.7 * Math.abs(t - 0.3)), 0.05, 1),
        v: clamp(base.v - (t - 0.3) * 0.6, 0.15, 1),
      };
    }
    if (harmony === "shades") return { h: base.h, s: base.s, v: clamp(1 - t * 0.8, 0.12, 1) };
    const offsets = HARMONIES.find((h) => h.id === harmony)?.offsets ?? [0, 180];
    const variant = VARIANTS[Math.floor(i / offsets.length) % VARIANTS.length] ?? VARIANTS[0]!;
    return {
      h: mod(base.h + (offsets[i % offsets.length] ?? 0), 360),
      s: clamp(base.s + variant.s, 0.05, 1),
      v: clamp(base.v + variant.v, 0.15, 1),
    };
  });
}
