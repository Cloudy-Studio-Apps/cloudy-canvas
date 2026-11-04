import type { DesignDataSources } from "../model";
import type { DataSourceElement } from "../source";
import type { IssueSink } from "./sink";

/** What this device knows of the sources: the last Update's error and pictures, never updated. */
export function sourceIssues(sources: DesignDataSources, sink: IssueSink): void {
  for (const source of sources.list()) {
    if (sink.full()) return;
    sourceChecks(sources, source, sink);
  }
}

function sourceChecks(
  sources: DesignDataSources,
  source: DataSourceElement,
  sink: IssueSink,
): void {
  const sourceId = source.id;
  const error = sources.error(sourceId);
  if (error !== null) sink.add({ kind: "source-error", sourceId, detail: error });
  if (!source.snapshot) {
    sink.add({ kind: "never-updated", sourceId, detail: source.name });
  }
  const failed = sources.imageFailureDetails(sourceId);
  if (failed.length > 0) {
    const reasons = new Map<string, number>();
    for (const { reason } of failed) reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
    const why = [...reasons].map(([reason, count]) => `${count} ${reason}`).join(", ");
    sink.add({
      kind: "image-failed",
      sourceId,
      detail: `${failed.length} (${why})`,
    });
  }
}
