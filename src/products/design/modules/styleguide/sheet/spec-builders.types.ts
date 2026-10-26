import type { ToolArgs } from "@canvas";

/** A label's look (see `label`). */
export interface LabelLook {
  size?: number;
  color?: string;
  weight?: string;
  font?: string;
  /** Wraps at this width (its height follows); unset grows with the text. */
  width?: number;
  lineHeight?: number;
}

/** Extra fields of a generated layer (an agent's `create_nodes` spec fields). */
export type SpecExtra = ToolArgs;
