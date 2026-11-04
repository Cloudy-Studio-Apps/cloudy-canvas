import { useService } from "@canvas-ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { DataSourceElement } from "../../source";
import { useDataVersion } from "./use-data-version";

/** The design's data sources, in order; re-renders when one changes or an Update moves on. */
export function useDataSources(): DataSourceElement[] {
  const sources = useService(DESIGN_DATA_SOURCES);
  useDataVersion(sources);
  return sources.list();
}
