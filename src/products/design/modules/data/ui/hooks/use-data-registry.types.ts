import type { DataFormat, DataSourceType } from "../../data.points.types";
import type { DataSourceFormEntry } from "../data.points.types";

/** What the modules registered for data sources. */
export interface DataRegistry {
  types: DataSourceType[];
  formats: DataFormat[];
  forms: DataSourceFormEntry[];
}
