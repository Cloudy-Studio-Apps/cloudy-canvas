import type { ImportFile } from "@canvas";
import { baseName } from "./external-texture";
import { findFile } from "./find-file";
import type { SiblingReader } from "./import-model.types";
import { toText } from "./bytes";

/**
 * The files a `.gltf` refers to (its buffers and images), found like textures are, by lower-case
 * name. A missing buffer is an error (the model can't be read without it); a missing picture only
 * leaves its texture missing.
 */
export async function gltfFiles(
  gltf: Uint8Array,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<Map<string, Uint8Array>> {
  let json: { buffers?: { uri?: string }[]; images?: { uri?: string }[] };
  try {
    json = JSON.parse(toText(gltf)) as typeof json;
  } catch {
    throw new Error("The glTF file isn't valid JSON");
  }
  const files = new Map<string, Uint8Array>();
  const fetchAll = async (uris: (string | undefined)[], required: boolean) => {
    for (const uri of uris) {
      if (!uri || uri.startsWith("data:")) continue;
      const name = decodeURIComponent(uri);
      const bytes = await findFile(name, others, readSibling);
      if (bytes) files.set(baseName(name).toLowerCase(), bytes);
      else if (required) throw new Error(`The glTF file needs "${name}", which wasn't found`);
    }
  };
  await fetchAll(
    (json.buffers ?? []).map((b) => b.uri),
    true,
  );
  await fetchAll(
    (json.images ?? []).map((i) => i.uri),
    false,
  );
  return files;
}
