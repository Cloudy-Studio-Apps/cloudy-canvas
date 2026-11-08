import type { LoadingManager, Object3D } from "three";
import type { ModelFormat } from "@canvas";
import { collectMaterials, GLTF_INDEX } from "./collect-materials";
import { toArrayBuffer, toText } from "./bytes";
import type { ThreeKit } from "./load-three.types";
import { createModelManager } from "./model-manager";
import type { ParsedModel, ParseModelOptions } from "./parse-model.types";

/**
 * Builds the three.js object of a model file. Files the model refers to (a `.gltf`'s buffers and
 * images) come from `files` by lower-case name; every other reference stays external, which
 * `externalFileOf` reads back from the textures. Throws `Error` when the file can't be parsed.
 */
export async function parseModel(
  kit: ThreeKit,
  { format, model, mtl, files = new Map() }: ParseModelOptions,
): Promise<ParsedModel> {
  const loading = createModelManager(kit, files);
  try {
    const object = await build(kit, format, model, mtl, loading.manager);
    await loading.settled();
    return { object, release: loading.dispose };
  } catch (error) {
    loading.dispose();
    throw new Error(`Couldn't read the ${format.toUpperCase()} model: ${describe(error)}`, {
      cause: error,
    });
  }
}

async function build(
  kit: ThreeKit,
  format: ModelFormat,
  model: Uint8Array,
  mtl: Uint8Array | null,
  manager: LoadingManager,
): Promise<Object3D> {
  switch (format) {
    case "glb":
    case "gltf": {
      const gltf = await new kit.GLTFLoader(manager).parseAsync(toArrayBuffer(model), "");
      tagMaterials(gltf.scene, gltf.parser.associations);
      return gltf.scene;
    }
    case "fbx":
      return new kit.FBXLoader(manager).parse(toArrayBuffer(model), "");
    case "obj": {
      const loader = new kit.OBJLoader(manager);
      if (mtl) loader.setMaterials(new kit.MTLLoader(manager).parse(toText(mtl), ""));
      return loader.parse(toText(model));
    }
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Remembers each material's index in the glTF (`GLTF_INDEX`), which the file's JSON speaks in. */
function tagMaterials(scene: Object3D, associations: Map<object, { materials?: number }>): void {
  for (const { material } of collectMaterials(scene, false)) {
    const index = associations.get(material)?.materials;
    if (index !== undefined) material.userData[GLTF_INDEX] = index;
  }
}
