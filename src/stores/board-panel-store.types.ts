export type TableEditorTab = "visual" | "dbml";

export interface BoardPanelState {
  /** Whether the side panel shows the whole schema's DBML instead of the selected table. */
  schemaOpen: boolean;
  tableTab: TableEditorTab;
  setSchemaOpen: (open: boolean) => void;
  setTableTab: (tab: TableEditorTab) => void;
}
