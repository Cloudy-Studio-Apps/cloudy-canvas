import type { MaskType } from "../core";

/** What `maskNodes` makes of the mask, beyond Figma's toggle (agents set them). */
export interface MaskOptions {
  type?: MaskType;
  inverted?: boolean;
}
