import type { ComponentType } from "react";

import type { EditorModeDefinition } from "@canvas-ui";
import type { DesignToolOptions } from "@design";
import type { LeftTabEntry } from "./design-editor-points.types";

/** A rail tab of a mode (shown only while it's on); `order` defaults to its place in the list. */
export type DesignModeTab = Omit<LeftTabEntry, "modes" | "order"> & { order?: number };

/**
 * A design mode in one object: the canvas and editor parts every mode has, plus the rail (exactly
 * its tabs while it's on, plus the default tabs it keeps) and the properties panel's sidebar.
 */
export type DesignModeDefinition = EditorModeDefinition<DesignToolOptions> & {
  rail?: { tabs: readonly DesignModeTab[]; keep?: readonly string[] };
  sidebar?: ComponentType | { component: ComponentType; keepSections: readonly string[] };
};
