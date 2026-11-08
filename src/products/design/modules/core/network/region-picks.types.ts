/**
 * A picked region: its index when picked and its key (its loops), so the pick finds the same
 * region again after an undo or an edit renumbers the regions.
 */
export interface RegionPick {
  index: number;
  key: string;
}
