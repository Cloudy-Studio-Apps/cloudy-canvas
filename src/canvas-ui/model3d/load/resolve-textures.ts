import type { ImportedSlot, ImportFile } from "@canvas";
import { imageTypeFromName } from "@shared/core";
import { findFile } from "./find-file";
import type { SiblingReader } from "./import-model.types";

/**
 * Finds the pictures of the slots that name an external file. Embedded slots are left alone. A file
 * that is not a picture the browser can show stays missing (`data: null`).
 */
export function resolveTextures(
  slots: readonly ImportedSlot[],
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<ImportedSlot[]> {
  return Promise.all(
    slots.map(async (slot) => {
      if (slot.embedded || !slot.file || !imageTypeFromName(slot.file)) return slot;
      return { ...slot, data: await findFile(slot.file, others, readSibling) };
    }),
  );
}
