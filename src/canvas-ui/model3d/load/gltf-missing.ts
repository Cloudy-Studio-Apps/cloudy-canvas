import type { GltfJson, GltfMissing } from "./gltf-files.types";

/** The three.js properties each glTF texture slot feeds. */
const SLOTS: [
  (m: NonNullable<GltfJson["materials"]>[number]) => { index: number } | undefined,
  string[],
][] = [
  [(m) => m.pbrMetallicRoughness?.baseColorTexture, ["map"]],
  [(m) => m.pbrMetallicRoughness?.metallicRoughnessTexture, ["metalnessMap", "roughnessMap"]],
  [(m) => m.normalTexture, ["normalMap"]],
  [(m) => m.occlusionTexture, ["aoMap"]],
  [(m) => m.emissiveTexture, ["emissiveMap"]],
];

/** The materials that use a picture in `notFound` (image index to file name). */
export function missingMaterials(json: GltfJson, notFound: ReadonlyMap<number, string>) {
  const missing = new Map<number, GltfMissing>();
  if (notFound.size === 0) return missing;
  for (const [index, material] of (json.materials ?? []).entries()) {
    for (const [pick, props] of SLOTS) {
      const texture = pick(material);
      const file = texture ? notFound.get(json.textures?.[texture.index]?.source ?? -1) : undefined;
      if (file === undefined) continue;
      const entry = missing.get(index) ?? { file, props: [] };
      entry.props.push(...props);
      missing.set(index, entry);
    }
  }
  return missing;
}
