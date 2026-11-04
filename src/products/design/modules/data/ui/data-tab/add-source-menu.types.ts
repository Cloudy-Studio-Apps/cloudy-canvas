import type { DataSourceType } from "../../data.points.types";

export interface AddSourceMenuProps {
  types: readonly DataSourceType[];
  /** A type was picked, by id. */
  onPick: (type: string) => void;
}
