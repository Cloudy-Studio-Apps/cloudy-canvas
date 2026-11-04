import { Emitter } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";
import type { DesignDataSources } from "../../model";
import type { UpdateResult } from "../../update";
import type { TabUpdates } from "./run-update.types";
import { t } from "../../data.i18n";

/**
 * The Updates this device's tab started, by service: each source's and the Update all loop, so any
 * view (a row, a detail, the header, after navigating away and back) sees and cancels them.
 */
const running = new WeakMap<DesignDataSources, TabUpdates>();

function updatesOf(sources: DesignDataSources): TabUpdates {
  let updates = running.get(sources);
  if (!updates) {
    updates = { bySource: new Map(), all: null, changed: new Emitter() };
    running.set(sources, updates);
  }
  return updates;
}

/** One Update, its failure reported (a cancelled one is not a failure). */
async function runOne(
  sources: DesignDataSources,
  id: string,
  controller: AbortController,
): Promise<UpdateResult | null> {
  const map = updatesOf(sources).bySource;
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
  if (updatesOf(sources).bySource.has(id)) return;
  void runOne(sources, id, new AbortController());
}

/** Updates every source one after another, unless that already runs; one cancel stops the rest. */
export async function startUpdateAll(sources: DesignDataSources): Promise<void> {
  const updates = updatesOf(sources);
  if (updates.all) return;
  const controller = new AbortController();
  updates.all = controller;
  updates.changed.emit();
  try {
    for (const source of sources.list()) {
      if (controller.signal.aborted) break;
      if (updates.bySource.has(source.id)) continue;
      await runOne(sources, source.id, controller);
    }
  } finally {
    updates.all = null;
    updates.changed.emit();
  }
}

/** Cancels the running Update all (the source it is on and the ones after it). */
export function cancelUpdateAll(sources: DesignDataSources): void {
  updatesOf(sources).all?.abort();
}

/** Whether Update all runs. */
export function isUpdatingAll(sources: DesignDataSources): boolean {
  return updatesOf(sources).all !== null;
}

/** Hears Update all start and end. */
export function onUpdateAllChange(sources: DesignDataSources, listener: () => void): () => void {
  return updatesOf(sources).changed.subscribe(listener);
}

/** Cancels the tab's running Update of a source (and, for Update all, the ones after it). */
export function cancelUpdate(sources: DesignDataSources, id: string): void {
  updatesOf(sources).bySource.get(id)?.abort();
}

/** Whether the tab started the running Update of a source, so it can cancel it. */
export function canCancelUpdate(sources: DesignDataSources, id: string): boolean {
  return updatesOf(sources).bySource.has(id);
}
