import type { DataIssue } from "../../checks";
import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceDetailProps {
  /** The source shown, or `null` to make a new one of `sourceType`. */
  source: DataSourceElement | null;
  sourceType: DataSourceType | undefined;
  /** Every issue found; the source's own are listed. */
  issues: readonly DataIssue[];
  /** Back to the list. */
  onBack: () => void;
  /** A new source was made, by id. */
  onCreated: (id: string) => void;
}
