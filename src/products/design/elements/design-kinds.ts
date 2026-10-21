import { ElementKinds } from "@canvas";

import type { DesignToolOptions } from "../design-options.types";

/** Every element type a design can hold (frames, rectangles, text, … as they're built). */
export const designKinds = new ElementKinds<DesignToolOptions>();
