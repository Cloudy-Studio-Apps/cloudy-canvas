import { BASE_KEYBINDINGS, type CanvasProduct } from "@canvas";

import type { DesignToolOptions } from "./design-options.types";
import { designKinds } from "./elements";

/** Designs (`.cdesign`, Figma-style). Only the shared select and hand tools so far. */
export const designProduct: CanvasProduct<DesignToolOptions> = {
  id: "design",
  kinds: designKinds,
  createTools: () => [],
  keybindings: BASE_KEYBINDINGS,
  defaultOptions: {},
};
