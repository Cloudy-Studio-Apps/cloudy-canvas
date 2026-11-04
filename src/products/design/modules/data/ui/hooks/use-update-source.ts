import { useService } from "@canvas-ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import { canCancelUpdate, cancelUpdate, startUpdate } from "./run-update";
import { useDataVersion } from "./use-data-version";
import type { SourceUpdate } from "./use-update-source.types";

/** Runs and cancels a source's Update (an `AbortController` per run) and shows its stage. */
export function useUpdateSource(id: string): SourceUpdate {
  const sources = useService(DESIGN_DATA_SOURCES);
  useDataVersion(sources);
  const stage = sources.stage(id);
  return {
    run: () => startUpdate(sources, id),
    stage,
    progress: sources.progress(id),
    cancel: () => cancelUpdate(sources, id),
    cancellable: stage !== null && canCancelUpdate(sources, id),
  };
}
