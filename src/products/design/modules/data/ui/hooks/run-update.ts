import { notifyError } from "@shared/stores/toast-store";
import type { DesignDataSources } from "../../model";
import type { UpdateResult } from "../../update";
import { t } from "../../data.i18n";

/** The Updates this device's tab started, by service and source, so any view can cancel them. */
const running = new WeakMap<DesignDataSources, Map<string, AbortController>>();

function runningOf(sources: DesignDataSources): Map<string, AbortController> {
  let map = running.get(sources);
  if (!map) {
    map = new Map();
    running.set(sources, map);
  }
  return map;
}

/** One Update, its failure reported (a cancelled one is not a failure). */
async function runOne(
  sources: DesignDataSources,
  id: string,
  controller: AbortController,
): Promise<UpdateResult | null> {
  const map = runningOf(sources);
  map.set(id, controller);
  const name = sources.get(id)?.name ?? "";
  try {
    const result = await sources.update(id, { signal: controller.signal });
    if (!result.ok && !result.aborted) {
      notifyError(t("update.failed", { name }), new Error(result.error ?? ""));
    }
    return result;
  } catch (error) {
    notifyError(t("update.failed", { name }), error);
    return null;
  } finally {
    if (map.get(id) === controller) map.delete(id);
  }
}

/** Starts an Update of a source unless the tab already runs one for it. */
export function startUpdate(sources: DesignDataSources, id: string): void {
  if (runningOf(sources).has(id)) return;
  void runOne(sources, id, new AbortController());
}

/** Updates every source one after another; one cancel stops the rest. */
export async function startUpdateAll(sources: DesignDataSources): Promise<void> {
  const controller = new AbortController();
  for (const source of sources.list()) {
    if (controller.signal.aborted) break;
    if (runningOf(sources).has(source.id)) continue;
    await runOne(sources, source.id, controller);
  }
}

/** Cancels the tab's running Update of a source (and, for Update all, the ones after it). */
export function cancelUpdate(sources: DesignDataSources, id: string): void {
  runningOf(sources).get(id)?.abort();
}

/** Whether the tab started the running Update of a source, so it can cancel it. */
export function canCancelUpdate(sources: DesignDataSources, id: string): boolean {
  return runningOf(sources).has(id);
}

/** Cancels every Update the tab runs. */
export function cancelAllUpdates(sources: DesignDataSources): void {
  for (const controller of runningOf(sources).values()) controller.abort();
}
