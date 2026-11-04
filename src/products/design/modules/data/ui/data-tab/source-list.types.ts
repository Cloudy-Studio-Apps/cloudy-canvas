import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceListProps {
  sources: readonly DataSourceElement[];
  types: readonly DataSourceType[];
  /** Opens a source's detail, by id. */
  onOpen: (id: string) => void;
}
