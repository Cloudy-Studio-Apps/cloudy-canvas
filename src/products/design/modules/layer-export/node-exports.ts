import { createId } from "@shared/core";

import type { NodeExport, NodeExportFormat } from "../core";

/** The sizes an export can have, as multiples of the layer's size. */
export const EXPORT_SCALES: readonly number[] = [0.5, 0.75, 1, 1.5, 2, 3, 4];
export const EXPORT_FILE_TYPES: readonly NodeExportFormat[] = ["png", "jpg", "webp", "svg", "pdf"];

/** What a size's files are named with unless the user says otherwise (`@2x`; none at 1x). */
export function defaultSuffix(scale: number): string {
  return scale === 1 ? "" : `@${scale}x`;
}

/** A new export: the next size the layer doesn't have yet, in the type of the last one. */
export function createNodeExport(existing: readonly NodeExport[]): NodeExport {
  const scale = EXPORT_SCALES.find((s) => s >= 1 && !existing.some((row) => row.scale === s)) ?? 1;
  return {
    id: createId(),
    scale,
    suffix: defaultSuffix(scale),
    format: existing.at(-1)?.format ?? "png",
  };
}

/** The export at a new size: a suffix that was the size's default follows it. */
export function withScale(row: NodeExport, scale: number): NodeExport {
  const suffix = row.suffix === defaultSuffix(row.scale) ? defaultSuffix(scale) : row.suffix;
  return { ...row, scale, suffix };
}

/** Whether a file type's output depends on its size (SVG and PDF are vector). */
export function hasSize(format: NodeExportFormat): boolean {
  return format !== "svg" && format !== "pdf";
}
