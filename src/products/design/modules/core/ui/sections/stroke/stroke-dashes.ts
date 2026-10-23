import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import type { DashStyle } from "./stroke-dashes.types";

/** A node's dash style: dots are zero-length dashes with round ends. */
export function dashStyle(node: DesignNode): DashStyle {
  const dashes = node.strokeDashes;
  if (dashes.length === 0) return "solid";
  if (dashes.length !== 2) return "custom";
  return dashes[0] === 0 && node.strokeCap === "round" ? "dotted" : "dashed";
}

/** Gives a node a dash style, sized by its stroke weight. */
export function dashStylePatch(style: DashStyle, node: DesignNode): ElementPatch<DesignNode> {
  const weight = Math.max(1, node.strokeWeight);
  switch (style) {
    case "solid":
      return { strokeDashes: [] };
    case "dashed":
      return {
        strokeDashes: [weight * 4, weight * 2],
        ...(dashStyle(node) === "dotted" ? { strokeCap: "none" as const } : {}),
      };
    case "dotted":
      return { strokeDashes: [0, weight * 2], strokeCap: "round" };
    case "custom":
      return {
        strokeDashes:
          node.strokeDashes.length > 0
            ? node.strokeDashes
            : [weight * 4, weight * 2, weight, weight * 2],
      };
  }
}

/** A pattern as typed ("8, 4" or "8 4 2 4"): its lengths, or `null` when it isn't one. */
export function parseDashes(text: string): number[] | null {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return [];
  const lengths = parts.map(Number);
  return lengths.every((n) => Number.isFinite(n) && n >= 0) ? lengths : null;
}

export function formatDashes(dashes: readonly number[]): string {
  return dashes.map((n) => String(Number(n.toFixed(2)))).join(", ");
}
