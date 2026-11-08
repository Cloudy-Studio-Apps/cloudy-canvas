import type { Object3D } from "three";
import type { ModelFormat } from "@canvas";

export interface ParseModelOptions {
  format: ModelFormat;
  model: Uint8Array;
  /** The OBJ's material file. */
  mtl: Uint8Array | null;
  /** Files the model refers to, by lower-case name. */
  files?: ReadonlyMap<string, Uint8Array>;
}

export interface ParsedModel {
  object: Object3D;
  /** Releases what parsing held on to (blob URLs); the object stays valid. */
  release(): void;
}
