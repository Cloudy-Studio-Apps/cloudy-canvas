import type { DataIssue } from "../../checks";
import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceListProps {
  sources: readonly DataSourceElement[];
  types: readonly DataSourceType[];
  /** Every issue found; each row shows its source's. */
  issues: readonly DataIssue[];
  /** Opens a source's detail, by id. */
  onOpen: (id: string) => void;
}
