/** What the DBML editor can name: the board schema's tables (with their columns) and enums. */
export interface DbmlNames {
  tables: { name: string; columns: string[] }[];
  enums: string[];
}
