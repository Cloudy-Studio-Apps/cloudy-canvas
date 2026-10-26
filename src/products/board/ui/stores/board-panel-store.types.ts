export type TableEditorTab = "visual" | "dbml";
export type ErEditorTab = "visual" | "text";

export interface BoardPanelState {
  /** Whether the side panel shows the whole schema's DBML instead of the selected table. */
  schemaOpen: boolean;
  tableTab: TableEditorTab;
  /** Whether the ER diagram editor is open. It stays open while its text empties the diagram. */
  erOpen: boolean;
  erTab: ErEditorTab;
  /** The ER diagram the editor shows: the selected elements' one, or the last one picked. */
  erDiagram: string | null;
  /** Whether the ER panel is folded to a small bar (in the ER mode, where it can't be closed). */
  erCollapsed: boolean;
  /** Whether the library of widgets, templates and more is open above the toolbar. */
  libraryOpen: boolean;
  /** Whether the board's colors (its color variables) are open in the side panel. */
  colorsOpen: boolean;
  setSchemaOpen: (open: boolean) => void;
  setTableTab: (tab: TableEditorTab) => void;
  setErOpen: (open: boolean) => void;
  setErTab: (tab: ErEditorTab) => void;
  setErDiagram: (diagram: string | null) => void;
  setErCollapsed: (collapsed: boolean) => void;
  setLibraryOpen: (open: boolean) => void;
  setColorsOpen: (open: boolean) => void;
}
