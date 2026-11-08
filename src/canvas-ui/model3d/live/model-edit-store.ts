import { clamp, MODEL_EDIT_LOCKS, ZOOM_RANGE } from "@canvas";
import { notifyError, toast } from "@shared/stores/toast-store";
import { create } from "zustand";

import { t } from "../model3d.i18n";
import { finishModelEdit } from "./finish-model-edit";
import type { ModelEditState } from "./model-edit-store.types";

const IDLE = { engine: null, id: null, data: null, status: "idle", draft: null } as const;

/** The model being edited live, and its draft (see `ModelEditState`). */
export const useModelEditStore = create<ModelEditState>()((set, get) => ({
  ...IDLE,
  start: (engine, id, data) => {
    const current = get();
    if (current.engine === engine && current.id === id) return;
    if (current.id) void current.stop();
    if (engine.doc.isReadOnly) {
      toast({ title: t("edit.readOnly") });
      return;
    }
    const locks = engine.service(MODEL_EDIT_LOCKS);
    try {
      locks.assertFree(id);
    } catch {
      toast({ title: t("edit.busy"), description: t("edit.busyHint") });
      return;
    }
    locks.lockLocal(id);
    // An editor closing mid-edit still writes it.
    engine.onClose("model3d.edit", () => get().stopIn(engine));
    set({
      engine,
      id,
      data,
      status: "loading",
      draft: { angle: { ...data.angle }, zoom: data.zoom, textures: data.textures },
    });
  },
  change: (patch) =>
    set((state) => {
      if (!state.draft) return state;
      const draft = { ...state.draft, ...patch };
      draft.zoom = clamp(draft.zoom, ZOOM_RANGE.min, ZOOM_RANGE.max);
      return { draft };
    }),
  ready: (id) =>
    set((state) => (state.id === id && state.status === "loading" ? { status: "live" } : state)),
  stop: async () => {
    const { engine, id, data, draft } = get();
    if (!engine || !id) return;
    set(IDLE);
    const locks = engine.service(MODEL_EDIT_LOCKS);
    if (locks.localLock() === id) locks.lockLocal(null);
    if (!data || !draft) return;
    try {
      await finishModelEdit(engine, id, data, draft);
    } catch (error) {
      notifyError(t("edit.failed"), error);
    }
  },
  stopIn: (engine) => (get().engine === engine ? get().stop() : Promise.resolve()),
}));
