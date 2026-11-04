import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceDetailProps {
  /** The source shown, or `null` to make a new one of `sourceType`. */
  source: DataSourceElement | null;
  sourceType: DataSourceType | undefined;
  /** Back to the list. */
  onBack: () => void;
  /** A new source was made, by id. */
  onCreated: (id: string) => void;
}
