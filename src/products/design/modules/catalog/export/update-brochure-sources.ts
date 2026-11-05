import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_DATA_SOURCES } from "../../data";
import { SourceUpdateError } from "./source-update-error";

/**
 * Updates sources one after another before an export, as their Update buttons do (one undo step
 * each, in the workspace's history): the first that fails, or that finishes with warnings (a
 * paged API that stopped early, so its rows are partial), throws a `SourceUpdateError` and the
 * rest aren't updated, so an export never goes on with data the user asked to refresh and didn't
 * get whole. The warnings are the error's reason, one per line; the Update stays saved.
 * `onSource` hears each source's name as its Update starts.
 */
export async function updateBrochureSources(
  workspace: DesignWorkspace,
  ids: readonly string[],
  onSource?: (name: string) => void,
): Promise<void> {
  const sources = workspace.service(DESIGN_DATA_SOURCES);
  for (const id of ids) {
    const name = sources.get(id)?.name ?? id;
    onSource?.(name);
    let error: string | null;
    try {
      const result = await sources.update(id);
      if (!result.ok) error = result.error ?? "it failed";
      else error = result.warnings?.length ? result.warnings.join("\n") : null;
    } catch (thrown) {
      error = thrown instanceof Error ? thrown.message : String(thrown);
    }
    if (error !== null) throw new SourceUpdateError(name, error);
  }
}
