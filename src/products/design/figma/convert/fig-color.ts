import type { FigColor } from "./fig-node.types";

/** `#rrggbb` from Figma's 0–1 channels (alpha is kept apart, in the paint's opacity). */
export function hexOf(color: FigColor | undefined): string {
  if (!color) return "#000000";
  const channel = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

/** Hex string of bytes (an image's hash, as its file in `images/` is named). */
export function hexBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
