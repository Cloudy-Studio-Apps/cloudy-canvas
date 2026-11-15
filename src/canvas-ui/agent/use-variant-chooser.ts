import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";

import { mod, type VariantPick } from "@canvas";
import { useEngine, useEngineState } from "../engine-context";
import { useTabContext } from "../tabs/tab-context";
import { useIsActiveTab } from "../tabs/use-is-active-tab";
import { variantChoices } from "./variant-choices-instance";
import type { VariantChooser } from "./use-variant-chooser.types";

/**
 * The pending variant request of this editor's tab, with the user's actions on it: the arrows and
 * "Compare all" move the user's own view, "Keep this" deletes the other variants as one step of
 * the user's history. `null` without a request.
 */
export function useVariantChooser(): VariantChooser | null {
  const engine = useEngine();
  const { tabId } = useTabContext();
  const active = useIsActiveTab();
  const scope = useEngineState((state) => state.scope);
  const request = useSyncExternalStore(variantChoices.store.subscribe, () =>
    variantChoices.pending(tabId),
  );
  // Re-render on document changes while a request is pending, so variants the user deletes drop out.
  const [, changed] = useReducer((count: number) => count + 1, 0);
  const pending = request !== null;
  useEffect(() => (pending ? engine.doc.observe(changed) : undefined), [engine, pending]);
  // The variant on screen, by id, so deleting another one never moves the choice.
  const [chosen, setChosen] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const shown = useRef<typeof request>(null);

  // Only the variants still on the page on screen (the scene's), so one moved away is never deleted.
  const present = request ? request.ids.filter((id) => engine.getElement(id) !== undefined) : [];
  const onPage = request !== null && scope === request.scope;
  const current = request ? currentIndex(present, request.ids, chosen) : 0;

  // The first time the request is on screen, fit all the variants (once per request).
  useEffect(() => {
    if (!request || !active || !onPage || shown.current === request) return;
    shown.current = request;
    const onScreen = request.ids.filter((id) => engine.getElement(id) !== undefined);
    setChosen(onScreen[0] ?? null);
    setNote("");
    engine.zoomToElements(onScreen);
  }, [request, active, onPage, engine]);

  if (!request) return null;

  const resolve = (pick: VariantPick) => variantChoices.resolve(tabId, pick);
  const withNote = note.trim() ? { note: note.trim() } : {};
  const go = (step: number) => {
    const id = present[mod(current + step, present.length)];
    if (id === undefined) return;
    setChosen(id);
    engine.zoomToElement(id);
  };

  return {
    request,
    present,
    index: current,
    onPage,
    note,
    setNote,
    previous: () => go(-1),
    next: () => go(1),
    compareAll: () => engine.zoomToElements(present),
    backToPage: () => {
      if (request.scope !== null) engine.setScope(request.scope);
    },
    keepThis: () => {
      const kept = present[current];
      if (!onPage || kept === undefined) return;
      const removed = present.filter((id) => id !== kept);
      if (removed.length > 0) engine.deleteElements(removed);
      const label = request.labels[request.ids.indexOf(kept)] ?? kept;
      resolve({ choice: "one", kept, label, removed, ...withNote });
    },
    keepAll: () => resolve({ choice: "all", ...withNote }),
    close: () => resolve({ choice: "dismissed" }),
  };
}

/**
 * Where the chosen variant is in `present`; when it's gone, the next listed one still there (else
 * the last), so the choice stays next to where it was.
 */
function currentIndex(present: string[], ids: string[], chosen: string | null): number {
  if (present.length === 0) return 0;
  const found = chosen === null ? -1 : present.indexOf(chosen);
  if (found !== -1) return found;
  const from = chosen === null ? 0 : ids.indexOf(chosen);
  const after = present.findIndex((id) => ids.indexOf(id) >= from);
  return after === -1 ? present.length - 1 : after;
}
