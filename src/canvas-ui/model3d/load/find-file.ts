import type { ImportFile } from "@canvas";
import type { SiblingReader } from "./import-model.types";
import { baseName } from "./external-texture";

/**
 * A file a model refers to: next to the model on disk first, then among the files that came with
 * it, matched by name regardless of case. `null` when neither has it.
 */
export async function findFile(
  reference: string,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<Uint8Array | null> {
  if (readSibling) {
    const bytes = await readSibling(reference);
    if (bytes) return bytes;
  }
  const wanted = baseName(reference).toLowerCase();
  return others.find((file) => file.name.toLowerCase() === wanted)?.data ?? null;
}
