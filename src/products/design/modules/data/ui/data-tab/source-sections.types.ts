import type { DataSourceType } from "../../data.points.types";
import type { DataSourceElement } from "../../source";

export interface SourceSectionsProps {
  source: DataSourceElement;
  /** Its type, when it is registered (a plugin's type may be missing). */
  sourceType: DataSourceType | undefined;
  /** It was removed. */
  onRemoved: () => void;
}
