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
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const shown = useRef<typeof request>(null);

  const present = request ? request.ids.filter((id) => engine.doc.get(id) !== undefined) : [];
  const onPage = request !== null && scope === request.scope;
  const current = present.length > 0 ? mod(index, present.length) : 0;

  // The first time the request is on screen, fit all the variants (once per request).
  useEffect(() => {
    if (!request || !active || !onPage || shown.current === request) return;
    shown.current = request;
    setIndex(0);
    setNote("");
    engine.zoomToElements(request.ids.filter((id) => engine.doc.get(id) !== undefined));
  }, [request, active, onPage, engine]);

  if (!request) return null;

  const resolve = (pick: VariantPick) => variantChoices.resolve(tabId, pick);
  const withNote = note.trim() ? { note: note.trim() } : {};
  const go = (step: number) => {
    const next = mod(current + step, present.length);
    setIndex(next);
    const id = present[next];
    if (id) engine.zoomToElement(id);
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
