import { zOrderKey } from "../elements";
import type { ElementMasks, LayerPlacement } from "./layer-placement.types";

/** No masks at all. */
export const NO_MASKS: ElementMasks = { masks: new Map(), homes: new Map() };

/** Stacking by `zOrderKey`, no clips or masks: layers that don't follow a scene (e.g. previews). */
export const DEFAULT_PLACEMENT: LayerPlacement = {
  orderOf: zOrderKey,
  clipOf: () => null,
  masks: () => NO_MASKS,
};
