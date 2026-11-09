import type { ImportFile } from "@canvas";
import { toText } from "./bytes";
import { baseName, safeDecode } from "./external-texture";
import { isBinName, isPictureName } from "./companion-names";
import { findFile } from "./find-file";
import type { GltfFiles, GltfJson } from "./gltf-files.types";
import { missingMaterials } from "./gltf-missing";
import type { SiblingReader } from "./import-model.types";

/**
 * The files a `.gltf` refers to (its `.bin` buffers and its pictures), found like textures are,
 * by lower-case name, and which materials refer to a picture that wasn't found (read from the glTF's JSON, since
 * the loader can't tell). A missing buffer is an error (the model can't be read without it).
 */
export async function gltfFiles(
  gltf: Uint8Array,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<GltfFiles> {
  let json: GltfJson;
  try {
    json = JSON.parse(toText(gltf)) as GltfJson;
  } catch {
    throw new Error("The glTF file isn't valid JSON");
  }
  const files = new Map<string, Uint8Array>();
  const notFound = new Map<number, string>();
  const fetchAll = async (
    uris: (string | undefined)[],
    required: boolean,
    accepts: (name: string) => boolean,
  ) => {
    for (const [index, uri] of uris.entries()) {
      if (!uri || uri.startsWith("data:")) continue;
      const name = safeDecode(uri);
      const bytes = await findFile(name, others, readSibling, accepts);
      if (bytes) files.set(baseName(name).toLowerCase(), bytes);
      else if (required) throw new Error(`The glTF file needs "${name}", which wasn't found`);
      else notFound.set(index, name);
    }
  };
  await fetchAll(
    (json.buffers ?? []).map((b) => b.uri),
    true,
    isBinName,
  );
  await fetchAll(
    (json.images ?? []).map((i) => i.uri),
    false,
    isPictureName,
  );
  return { files, missing: missingMaterials(json, notFound) };
}
