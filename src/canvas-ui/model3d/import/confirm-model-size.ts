import { showModelSize } from "./model-size-prompt";

/**
 * Asks whether to add a model this big (`MODEL_SIZE_WARNING_BYTES`), in the `ModelSizeDialog` the
 * editor mounts. Resolves `true` on Continue, `false` on Cancel or when closed. Without a mounted
 * dialog it never resolves, so every editor with a model kind mounts one.
 */
export function confirmModelSize(name: string, bytes: number): Promise<boolean> {
  return new Promise((resolve) => showModelSize({ name, bytes, resolve }));
}
