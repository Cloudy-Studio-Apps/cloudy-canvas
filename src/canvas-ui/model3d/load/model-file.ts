import { MODEL_EXTENSIONS, type ModelFormat } from "@canvas";
import { extensionOf } from "@shared/core";

/** The model format a file name stands for, or `null` when it isn't one. */
export function modelFormatOf(name: string): ModelFormat | null {
  const ext = extensionOf(name);
  return MODEL_EXTENSIONS.find((format) => format === ext) ?? null;
}

/** Whether the file name is a 3D model this app imports. */
export function isModelFileName(name: string): boolean {
  return modelFormatOf(name) !== null;
}
