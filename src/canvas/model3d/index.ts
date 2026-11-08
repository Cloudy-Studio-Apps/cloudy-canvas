// 3D models, the plain-TS side both products share: the data an element holds, the ids of its
// assets and the sweep that removes the ones nothing uses.
export type * from "./model3d.types";
export {
  DEFAULT_MODEL_VIEW,
  LIVE_RELEASE_DELAY_MS,
  MODEL_EXTENSIONS,
  MODEL_SIZE_WARNING_BYTES,
  PICTURE_MAX_SIDE,
  PICTURE_SCALE,
  ZOOM_RANGE,
} from "./model3d.constants";
export { isModelAssetId, newModelAssetId } from "./model-asset-id";
export { isModelKind, modelAssets } from "./model-kind";
export { unusedModelAssets } from "./sweep-model-assets";
