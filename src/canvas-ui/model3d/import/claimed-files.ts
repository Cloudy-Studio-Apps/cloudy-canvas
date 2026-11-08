import type { ImportFile, ModelImport } from "@canvas";
import { baseName } from "../load/external-texture";

/** Extensions of files that only ever belong to a model (a material file, a glTF's buffer). */
const COMPANION_EXTENSIONS = [".mtl", ".bin"];

/**
 * The names of the companion files an import used: the pictures its slots name (matched by name
 * regardless of case, as the importer does) and any `.mtl` or `.bin` that came with it.
 */
export function companionNames(imp: ModelImport, others: readonly ImportFile[]): string[] {
  const wanted = new Set<string>();
  for (const slot of imp.slots) if (slot.file) wanted.add(baseName(slot.file).toLowerCase());
  return others
    .filter((file) => {
      const name = file.name.toLowerCase();
      return wanted.has(name) || COMPANION_EXTENSIONS.some((ext) => name.endsWith(ext));
    })
    .map((file) => file.name);
}
