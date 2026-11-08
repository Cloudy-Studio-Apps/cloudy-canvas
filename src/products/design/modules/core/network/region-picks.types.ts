/**
 * A picked region: its id, its index when picked and its key (its loops), so the pick finds the
 * same region again after an undo or an edit renumbers the regions.
 */
export interface RegionPick {
  index: number;
  key: string;
  /** The region's id, when it has one: what finds it first. */
  id?: string;
}
