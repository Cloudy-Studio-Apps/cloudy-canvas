import type { DataFormat, DataSourceType } from "../data.points.types";
import type { DataServices } from "../services";

/** What an Update is doing: fetching the data, parsing it, saving the snapshot. */
export type UpdateStage = "fetching" | "parsing" | "saving";

export interface UpdateOptions {
  signal?: AbortSignal;
  onStage?(stage: UpdateStage): void;
}

export interface UpdateResult {
  ok: boolean;
  rowCount: number;
  error?: string;
  /** Whether the data differs from the last snapshot. */
  changed: boolean;
  /** The Update was cancelled (its signal aborted): not a failure to report. */
  aborted?: boolean;
}

/** What an Update needs from the editor: the registered types and formats, and the platform. */
export interface DataContext {
  types: DataSourceType[];
  formats: DataFormat[];
  services: DataServices;
}
