import type { Material, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { ModelSource } from "@canvas";
import { collectMaterials } from "./collect-materials";
import { disposeObject } from "./dispose-object";
import { externalFileOf } from "./external-texture";
import { loadThree } from "./load-three";
import type { LoadedModel } from "./load-model.types";
import { parseModel } from "./parse-model";
import { textureFromBytes } from "./texture-from-bytes";

const GRAY = 0xb0b0b0;

/**
 * Builds the model to show: the textures of the source go on the materials of the same name as
 * their `map`; a material whose picture is missing (or an OBJ with no picture) is a neutral gray.
 * Throws `Error` when the model can't be parsed. Call `dispose` when it isn't shown any more.
 */
export async function loadModel(source: ModelSource): Promise<LoadedModel> {
  const kit = await loadThree();
  const parsed = await parseModel(kit, {
    format: source.format,
    model: source.model,
    mtl: source.mtl,
  });
  const { object } = parsed;
  const urls: string[] = [];
  try {
    const bare = source.format === "obj" && !source.mtl;
    for (const { slot, material } of collectMaterials(object, bare)) {
      const bytes = source.textures.get(slot);
      if (bytes) {
        const { texture, url } = await textureFromBytes(kit, bytes);
        urls.push(url);
        const lit = material as Material & { map?: unknown; color?: { set(c: number): void } };
        lit.map = texture;
        lit.color?.set(0xffffff);
        material.needsUpdate = true;
      } else if (bare || externalFileOf((material as { map?: { image?: unknown } }).map?.image)) {
        replaceWithGray(object, material, kit.THREE.MeshStandardMaterial);
      }
    }
  } catch (error) {
    disposeObject(object);
    parsed.release();
    for (const url of urls) URL.revokeObjectURL(url);
    throw error;
  }
  parsed.release();
  return {
    object,
    dispose() {
      disposeObject(object);
      for (const url of urls) URL.revokeObjectURL(url);
    },
  };
}

function replaceWithGray(
  object: Object3D,
  old: Material,
  Standard: new (
    parameters: ConstructorParameters<typeof MeshStandardMaterial>[0],
  ) => MeshStandardMaterial,
): void {
  const gray = new Standard({ color: GRAY, roughness: 0.8, metalness: 0, name: old.name });
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.material === old) mesh.material = gray;
    else if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m: Material) => (m === old ? gray : m));
    }
  });
  old.dispose();
}
