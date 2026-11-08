import { createId } from "@shared/core";

const PREFIX = "model3d:";

/** A new asset id for a 3D object's data (model, material, texture or picture). */
export function newModelAssetId(): string {
  return `${PREFIX}${createId()}`;
}

/** Whether an asset id belongs to a 3D object, the only ones the sweep may remove. */
export function isModelAssetId(id: string): boolean {
  return id.startsWith(PREFIX);
}
