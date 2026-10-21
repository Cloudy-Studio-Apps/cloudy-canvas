export type TableEditorTab = "visual" | "dbml";

export interface BoardPanelState {
  /** Whether the side panel shows the whole schema's DBML instead of the selected table. */
  schemaOpen: boolean;
  tableTab: TableEditorTab;
  /** Whether the ER diagram editor is open. It stays open while its text empties the diagram. */
  erOpen: boolean;
  setSchemaOpen: (open: boolean) => void;
  setTableTab: (tab: TableEditorTab) => void;
  setErOpen: (open: boolean) => void;
}
