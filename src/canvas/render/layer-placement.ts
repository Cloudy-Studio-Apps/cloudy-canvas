import { zOrderKey } from "../elements";
import type { LayerPlacement } from "./layer-placement.types";

/** Stacking by `zOrderKey` and no clips: layers that don't follow a scene (e.g. previews). */
export const DEFAULT_PLACEMENT: LayerPlacement = { orderOf: zOrderKey, clipOf: () => null };
