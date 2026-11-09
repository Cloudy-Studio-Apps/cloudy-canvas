import type { ImportFile } from "@canvas";
import type { SiblingReader } from "./import-model.types";
import { baseName } from "./external-texture";
import { siblingPaths } from "./sibling-paths";

/**
 * A file a model refers to, when its name is one `accepts` takes (a `.mtl` for `mtllib`, a `.bin`
 * for a glTF buffer, a picture for a texture): next to the model on disk first (see
 * `siblingPaths`: never an absolute or `..` path), then among the files that came with it,
 * matched by name regardless of case. `null` when neither has it.
 */
export async function findFile(
  reference: string,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
  accepts: (name: string) => boolean,
): Promise<Uint8Array | null> {
  const name = baseName(reference);
  if (!name || !accepts(name)) return null;
  if (readSibling) {
    for (const path of siblingPaths(reference)) {
      const bytes = await readSibling(path);
      if (bytes) return bytes;
    }
  }
  const wanted = name.toLowerCase();
  return others.find((file) => file.name.toLowerCase() === wanted)?.data ?? null;
}
