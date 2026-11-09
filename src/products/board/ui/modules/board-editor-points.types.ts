import type { EditorPoints, MainMenuGroup } from "@canvas-ui";
import type { ExtensionPoint } from "@shared/core";

/** The board editor's points: the shared editor points plus the main menu. */
export interface BoardEditorPoints extends EditorPoints {
  /** The groups of the main menu (the title bar's seal on a board tab): File, Edit, View, …. */
  mainMenu: ExtensionPoint<MainMenuGroup>;
}
