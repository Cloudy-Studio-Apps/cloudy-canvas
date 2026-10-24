import type { ComponentType } from "react";

import type { StyleRecord } from "@canvas";
import type { ExtensionIcon } from "@canvas-ui";
import type { DesignEngine } from "@design";

/** A style's row in the Styles section (its look, name and an editor on click). */
export interface StyleRowProps {
  style: StyleRecord;
  editing: boolean;
  setEditing: (open: boolean) => void;
  onDelete: () => void;
}

/**
 * A kind of style the Styles section lists and its "+" adds (Figma's Text, Color, Effect…). The
 * text module gives text styles; modules and plugins add theirs.
 */
export interface StyleTypeEntry {
  /** The `styleType` of its records, e.g. `"text"`. */
  id: string;
  /** The "+" menu's item, e.g. "Text". */
  label: string;
  /** The list's heading, e.g. "Text styles". */
  heading: string;
  icon: ExtensionIcon;
  order: number;
  /** Adds a new style of this type (from the selection or defaults); its id, or `null`. */
  create: (engine: DesignEngine) => string | null;
  Row: ComponentType<StyleRowProps>;
}
