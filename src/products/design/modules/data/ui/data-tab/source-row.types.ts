import type { DataIssue } from "../../checks";
import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceRowProps {
  source: DataSourceElement;
  /** Its type, when it is registered (a plugin's type may be missing). */
  sourceType: DataSourceType | undefined;
  /** The issues tied to this source. */
  issues: readonly DataIssue[];
  /** Opens its detail. */
  onOpen: () => void;
}
