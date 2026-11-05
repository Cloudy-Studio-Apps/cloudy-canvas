import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_DATA_SOURCES } from "../../data";
import { SourceUpdateError } from "./source-update-error";

/**
 * Updates sources one after another before an export, as their Update buttons do (one undo step
 * each, in the workspace's history): the first that fails throws a `SourceUpdateError` and the
 * rest aren't updated, so an export never goes on with data the user asked to refresh.
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
      error = result.ok ? null : (result.error ?? "it failed");
    } catch (thrown) {
      error = thrown instanceof Error ? thrown.message : String(thrown);
    }
    if (error !== null) throw new SourceUpdateError(name, error);
  }
}
