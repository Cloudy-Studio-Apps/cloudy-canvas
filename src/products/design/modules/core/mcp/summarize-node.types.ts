import type { ElementSummary } from "@canvas";

import type { AutoLayout, LayerBlendMode, MaskType, NodeSizing } from "../node";

/** A layer in listings: the element summary (its `label` is the layer's name) and its place. */
export interface NodeSummary extends ElementSummary {
  /** The frame, section or group holding it; `null` at the top of the page. */
  parentId: string | null;
  /** Set when the layer is hidden. */
  hidden?: true;
  /** Set when it blends some way other than pass-through or normal. */
  blendMode?: LayerBlendMode;
  /** Set on masks: how they mask, and whether inverted. */
  mask?: { type: MaskType; inverted?: true };
  /** The mask the layer shows through, directly (set on the layers a mask masks). */
  maskedBy?: string;
  /** A frame's auto layout (its layers' x/y follow it). */
  layout?: AutoLayout;
  /** Set when a side hugs or fills. */
  sizing?: NodeSizing;
  /** Set when it's drawn mirrored inside its box. */
  mirrored?: true;
  /** Set when its auto layout parent leaves it where it is. */
  layoutAbsolute?: true;
  /** The types of its visible effects, bottom to top (left out when it has none). */
  effects?: string[];
  /** Its fields driven by variables: field path → variable id (see list_variables). */
  bindings?: Record<string, string>;
  /** The mode of each collection it (and what it holds) uses, by collection id. */
  variableModes?: Record<string, string>;
}
