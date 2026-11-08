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

/** A file picked or dropped for an import: its name, where it lives (if known) and its bytes. */
export interface ImportFile {
  name: string;
  /** The file's path on disk; `null` on the web, where only the bytes are known. */
  path: string | null;
  data: Uint8Array;
}

/**
 * A texture the imported model asks for. `data` is the picture's bytes when it was found next to
 * the model; `null` when it is `embedded` in the model or missing.
 */
export interface ImportedSlot {
  name: string;
  file: string | null;
  embedded: boolean;
  data: Uint8Array | null;
}

/** What importing a model file produced, ready to be stored as assets. */
export interface ModelImport {
  format: ModelFormat;
  fileName: string;
  /** The bytes to store: the file itself, or a GLB for a `.gltf`. */
  model: Uint8Array;
  mtl: Uint8Array | null;
  slots: ImportedSlot[];
  /** Model, material file and found textures together. */
  totalBytes: number;
  /** Width over height of the model's first framing (`DEFAULT_MODEL_VIEW`). */
  aspect: number;
}

/** Everything the viewer needs to build a model: its bytes and the texture of each slot. */
export interface ModelSource {
  model: Uint8Array;
  mtl: Uint8Array | null;
  format: ModelFormat;
  /** Slot name to image bytes. */
  textures: ReadonlyMap<string, Uint8Array>;
}
