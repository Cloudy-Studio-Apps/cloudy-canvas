import type { Material, Object3D } from "three";
import { collectMaterials, GLTF_INDEX } from "./collect-materials";
import type { GltfMissing } from "./gltf-files.types";
import type { ThreeKit } from "./load-three.types";

/**
 * Writes a loaded glTF as one GLB (buffers and found pictures inside). The textures whose picture
 * was missing are taken out first, so the file doesn't carry a blank stand-in.
 */
export async function repackGltf(
  kit: ThreeKit,
  scene: Object3D,
  missing: ReadonlyMap<number, GltfMissing>,
): Promise<Uint8Array> {
  for (const { material } of collectMaterials(scene, false)) {
    const entry = missing.get(material.userData[GLTF_INDEX] as number);
    if (entry) dropProps(material, entry.props);
  }
  const glb = await new kit.GLTFExporter().parseAsync(scene, { binary: true });
  if (!(glb instanceof ArrayBuffer)) throw new Error("The glTF could not be packed as GLB");
  return new Uint8Array(glb);
}

function dropProps(material: Material, props: readonly string[]): void {
  const target = material as unknown as Record<string, unknown>;
  for (const prop of props) target[prop] = null;
  material.needsUpdate = true;
}
