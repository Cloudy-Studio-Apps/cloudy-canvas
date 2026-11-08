import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";

/** The file formats a model can be imported from. */
export type ModelFormat = "glb" | "gltf" | "obj" | "fbx";

/** A model's turn on each axis, in degrees. */
export interface ModelRotation {
  x: number;
  y: number;
  z: number;
}

/**
 * One texture the model asks for. Missing is `!embedded && assetId === null`: the file named by
 * `file` was not found next to the model.
 */
export interface ModelTextureSlot {
  /** The slot's name (e.g. a material's map). */
  name: string;
  /** The file name the model refers to, if it refers to one. */
  file: string | null;
  assetId: string | null;
  /** The texture is inside the model file itself. */
  embedded: boolean;
}

/** The fields both products' model elements add on top of their base. */
export interface ModelData {
  modelAssetId: string;
  /** The `.mtl` material file of an OBJ. */
  mtlAssetId: string | null;
  format: ModelFormat;
  fileName: string;
  /** Bytes of the model file. */
  fileSize: number;
  /** The saved picture of the model (what the canvas, exports and thumbnails show). */
  pictureAssetId: string;
  angle: ModelRotation;
  zoom: number;
  textures: ModelTextureSlot[];
}

/** An element kind that holds a 3D model (see `isModelKind`). */
export interface ModelKind {
  modelData(el: CanvasElement): ModelData;
}

/**
 * See `CanvasProduct.assetSweeps`: the ids of assets nothing refers to any more, which the engine
 * removes (`CanvasEngine.sweepAssets`).
 */
export type AssetSweep = (doc: CanvasDocument, kinds: ElementKinds) => string[];
