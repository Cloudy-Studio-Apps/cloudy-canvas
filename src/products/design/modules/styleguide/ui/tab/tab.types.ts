import type { StyleguideOutlineEntry } from "@design";

export interface CategoryRowProps {
  entry: StyleguideOutlineEntry;
  /** Its place in the list, for drops. */
  position: number;
  onDropCategory(id: string, position: number): void;
}

export interface GroupRowProps {
  entry: StyleguideOutlineEntry;
  groupId: string;
  title: string;
  count: number;
  /** Hidden from the view. */
  hidden: boolean;
}
