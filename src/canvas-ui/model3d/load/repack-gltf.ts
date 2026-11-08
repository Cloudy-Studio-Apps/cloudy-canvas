import type { Material, Object3D, Texture } from "three";
import { collectMaterials } from "./collect-materials";
import { externalFileOf } from "./external-texture";
import type { ThreeKit } from "./load-three.types";

/**
 * Writes a loaded glTF as one GLB (buffers and found pictures inside). Textures whose picture was
 * missing are taken out first, so the file doesn't carry a blank stand-in.
 */
export async function repackGltf(kit: ThreeKit, scene: Object3D): Promise<Uint8Array> {
  for (const { material } of collectMaterials(scene, false)) dropExternalMaps(material);
  const glb = await new kit.GLTFExporter().parseAsync(scene, { binary: true });
  if (!(glb instanceof ArrayBuffer)) throw new Error("The glTF could not be packed as GLB");
  return new Uint8Array(glb);
}

function dropExternalMaps(material: Material): void {
  const slots = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(slots)) {
    const value = slots[key] as Texture | null | undefined;
    if (
      value &&
      (value as { isTexture?: boolean }).isTexture &&
      externalFileOf(value.image) !== null
    ) {
      slots[key] = null;
    }
  }
  material.needsUpdate = true;
}
