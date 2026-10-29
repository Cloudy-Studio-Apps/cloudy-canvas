/** What the HTML export carries of the board's database schema. */
export interface DbViewerData {
  /** The whole schema as DBML. */
  schema: string;
  /** Each table and enum by element id: its name and its DBML. */
  items: Record<string, { name: string; code: string }>;
}
