import type { DataSourceType } from "../../data.points.types";

export interface CreateSourceFormProps {
  sourceType: DataSourceType;
  /** The source was made (and its Update started), by id. */
  onCreated: (id: string) => void;
  onCancel: () => void;
}
