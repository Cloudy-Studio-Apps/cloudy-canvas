export interface TrashEntry {
  id: string;
  name: string;
  /** The relative path it was at. */
  from: string;
  /** ISO 8601 timestamp */
  deletedAt: string;
  size: number;
  folder: boolean;
}
