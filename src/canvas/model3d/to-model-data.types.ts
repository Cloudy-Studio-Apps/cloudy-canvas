/** The asset ids a model import was stored under, matching `ModelImport.slots` by position. */
export interface ModelAssetIds {
  model: string;
  mtl: string | null;
  picture: string;
  /** One per slot: `null` for a slot with no picture stored (untextured, embedded or missing). */
  textures: (string | null)[];
}
