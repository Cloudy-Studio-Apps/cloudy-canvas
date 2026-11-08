/** A glTF material whose picture files were not found: the first file's name, and the three.js material properties those pictures feed. */
export interface GltfMissing {
  file: string;
  props: string[];
}

export interface GltfFiles {
  /** The files found, by lower-case name. */
  files: Map<string, Uint8Array>;
  /** Materials (by index in the glTF) that refer to a missing picture. */
  missing: Map<number, GltfMissing>;
}

export interface GltfJson {
  buffers?: { uri?: string }[];
  images?: { uri?: string }[];
  textures?: { source?: number }[];
  materials?: {
    pbrMetallicRoughness?: {
      baseColorTexture?: { index: number };
      metallicRoughnessTexture?: { index: number };
    };
    normalTexture?: { index: number };
    occlusionTexture?: { index: number };
    emissiveTexture?: { index: number };
  }[];
}
