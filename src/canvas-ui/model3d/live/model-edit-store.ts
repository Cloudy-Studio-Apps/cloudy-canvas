import { clamp, MODEL_EDIT_LOCKS, ZOOM_RANGE } from "@canvas";
import type { CanvasEngine, ModelData } from "@canvas";
import { notifyError, toast } from "@shared/stores/toast-store";
import { create } from "zustand";

import { t } from "../model3d.i18n";
import { finishModelEdit } from "./finish-model-edit";
import type { FinishingEdit, ModelDraft, ModelEditState } from "./model-edit-store.types";

/** The edit being written after it finished, until it's written (see `stopIn`). */
let finishing: FinishingEdit | null = null;

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
    // An editor closing mid-edit still writes it, and its closing save waits for that.
    engine.onClose("model3d.edit", () => get().stopIn(engine));
    engine.onBeforeSave("model3d.edit", () => get().stopIn(engine));
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
  stop: () => {
    const { engine, id, data, draft } = get();
    if (!engine || !id) return Promise.resolve();
    set(IDLE);
    const done = finish(engine, id, data, draft, get);
    finishing = { engine, done };
    void done.then(() => {
      if (finishing?.done === done) finishing = null;
    });
    return done;
  },
  stopIn: (engine) => {
    if (get().engine === engine) return get().stop();
    return finishing?.engine === engine ? finishing.done : Promise.resolve();
  },
}));

/**
 * Writes a finished edit, then releases this user's lock: the model counts as held until its
 * write landed, whatever happens, unless a new edit of the same model took the lock meanwhile.
 */
async function finish(
  engine: CanvasEngine<object>,
  id: string,
  data: ModelData | null,
  draft: ModelDraft | null,
  get: () => ModelEditState,
): Promise<void> {
  try {
    if (data && draft) await finishModelEdit(engine, id, data, draft);
  } catch (error) {
    notifyError(t("edit.failed"), error);
  } finally {
    const locks = engine.service(MODEL_EDIT_LOCKS);
    const current = get();
    const editedAgain = current.engine === engine && current.id === id;
    if (locks.localLock() === id && !editedAgain) locks.lockLocal(null);
  }
}
