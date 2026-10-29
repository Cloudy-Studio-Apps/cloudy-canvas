/** What the HTML export carries of the board's ER diagrams: each one's name and ER text, by id. */
export interface ErViewerData {
  diagrams: Record<string, { name: string; text: string }>;
}
