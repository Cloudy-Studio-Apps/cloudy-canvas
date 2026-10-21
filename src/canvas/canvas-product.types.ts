import type { ElementKinds } from "./elements";
import type { Keybindings } from "./input";
import type { Tool, ToolContext } from "./tools";

/**
 * What makes a canvas a board or a design file: its element types, its tools, its shortcuts and
 * its tool options. The engine is the same for every product; it's created with one of these.
 * `O` is the product's tool options (colors, sizes, … the options panel edits).
 */
export interface CanvasProduct<O extends object = object> {
  /** e.g. `"board"`; used in messages and logs. */
  readonly id: string;
  readonly kinds: ElementKinds<O>;
  /** The product's tools, added after the built-in select and hand tools. */
  createTools(ctx: ToolContext<O>): Tool[];
  /** Every command's shortcuts: `BASE_KEYBINDINGS` plus `tool.<id>` for the product's tools. */
  readonly keybindings: Keybindings;
  /** Tool options a new editor starts with. */
  readonly defaultOptions: O;
}
