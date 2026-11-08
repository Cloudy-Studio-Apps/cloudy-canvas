import type { ModelFormat, ModelRotation } from "./model3d.types";

/** Models larger than this (10 MB) get a warning before they're added. */
export const MODEL_SIZE_WARNING_BYTES = 10 * 1024 * 1024;

/** The file extensions of the formats a model can be imported from. */
export const MODEL_EXTENSIONS: readonly ModelFormat[] = ["glb", "gltf", "obj", "fbx"];

/** How many pixels per world unit the saved picture is drawn at (sharp when zoomed in). */
export const PICTURE_SCALE = 2;

/** The longest side of the saved picture, in pixels. */
export const PICTURE_MAX_SIDE = 4096;

/** How long the live view stays up after the pointer leaves, before it is released. */
export const LIVE_RELEASE_DELAY_MS = 3000;

/** How a model is first shown. */
export const DEFAULT_MODEL_VIEW: { angle: ModelRotation; zoom: number } = {
  angle: { x: 0, y: 0, z: 0 },
  zoom: 1,
};

/** What a model's zoom can be. */
export const ZOOM_RANGE = { min: 0.1, max: 10 } as const;
