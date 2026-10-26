import type { ModeContext } from "@canvas";

import type {
  SheetBuildContext,
  SheetGroup,
  StyleguideCategory,
  StyleguideTemplate,
} from "../styleguide.types";
import type { SheetModeView, StyleguideSettings, TokenSheet } from "./sheet.types";

/** What `buildSheet` builds a sheet's content from. */
export interface BuildSheetInput {
  sheet: TokenSheet;
  category: StyleguideCategory;
  /** The category's groups (all of them; the sheet's own source picks). */
  groups: readonly SheetGroup[];
  settings: StyleguideSettings;
  /** Group ids left out (the view's hidden groups; none for elements on pages). */
  hiddenGroups: ReadonlySet<string>;
  modeView: SheetModeView;
  templates(id: string): StyleguideTemplate | undefined;
  /** What templates build with, but the modes. */
  context: Omit<SheetBuildContext, "modes" | "resolve">;
  /** The sheet's own modes. */
  modes: ModeContext;
}
