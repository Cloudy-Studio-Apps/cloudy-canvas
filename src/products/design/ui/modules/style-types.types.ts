import type { ComponentType } from "react";

import type { StyleRecord } from "@canvas";
import type { ExtensionIcon } from "@canvas-ui";
import type { DesignEngine } from "@design";

/** A style's look, small (a row's icon, a chip). */
export interface StylePreviewProps {
  style: StyleRecord;
}

/** A style's editor (name, its value, description, delete), in a popover. */
export interface StyleEditorProps {
  style: StyleRecord;
  /** Asks to delete it (the caller confirms, counting the layers using it). */
  onDelete: () => void;
}

/**
 * A kind of style the Styles section lists and its "+" adds (Figma's Text, Color, Effect…), with
 * how its styles look and are edited. The modules owning the fields give theirs (text, the core's
 * color and stroke styles, effects); plugins add more.
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
  Preview: ComponentType<StylePreviewProps>;
  /** A short description after its name ("16/120%", "#3B82F6", "2 · Inside"). */
  summary: (style: StyleRecord) => string;
  Editor: ComponentType<StyleEditorProps>;
}
