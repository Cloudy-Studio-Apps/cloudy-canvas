import { DEFAULT_MODEL_VIEW, type ImportFile, type ModelImport } from "@canvas";
import { frameModel } from "../bake/frame-model";
import { disposeObject } from "./dispose-object";
import { gltfFiles } from "./gltf-files";
import type { SiblingReader } from "./import-model.types";
import { loadThree } from "./load-three";
import { findMtl } from "./mtl-file";
import { modelFormatOf } from "./model-file";
import { parseModel } from "./parse-model";
import { repackGltf } from "./repack-gltf";
import { resolveTextures } from "./resolve-textures";
import { slotsOf } from "./slots-of";

/**
 * Reads a model file (and the files that came with it) into what the document stores: the model's
 * bytes (a `.gltf` is re-packed as one GLB), its material file, a slot per texture with the
 * picture when it was found, and the aspect of its first framing. Throws `Error` when the file
 * isn't a model or can't be parsed.
 */
export async function importModel(
  main: ImportFile,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<ModelImport> {
  const format = modelFormatOf(main.name);
  if (!format) throw new Error(`"${main.name}" is not a supported 3D model`);
  const kit = await loadThree();

  const mtl = format === "obj" ? await findMtl(main, others, readSibling) : null;
  const files = format === "gltf" ? await gltfFiles(main.data, others, readSibling) : undefined;
  const parsed = await parseModel(kit, { format, model: main.data, mtl, files });
  try {
    const slots = await resolveTextures(
      slotsOf(parsed.object, format === "obj" && !mtl),
      others,
      readSibling,
    );
    const model = format === "gltf" ? await repackGltf(kit, parsed.object) : main.data;
    const camera = new kit.THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    const { aspect } = frameModel(parsed.object, camera, DEFAULT_MODEL_VIEW);
    const totalBytes =
      model.byteLength +
      (mtl?.byteLength ?? 0) +
      slots.reduce((sum, slot) => sum + (slot.data?.byteLength ?? 0), 0);
    return { format, fileName: main.name, model, mtl, slots, totalBytes, aspect };
  } finally {
    disposeObject(parsed.object);
    parsed.release();
  }
}
