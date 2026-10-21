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
  setSchemaOpen: (open: boolean) => void;
  setTableTab: (tab: TableEditorTab) => void;
  setErOpen: (open: boolean) => void;
  setErTab: (tab: ErEditorTab) => void;
  setErDiagram: (diagram: string | null) => void;
}
