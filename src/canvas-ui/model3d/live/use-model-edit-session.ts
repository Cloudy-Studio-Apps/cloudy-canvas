import { useEffect } from "react";

import { isModelKind, MODEL_ACTIONS } from "@canvas";
import type { CanvasEngine } from "@canvas";

import { useEngineState } from "../../engine-context";
import { useEngineElement } from "../../use-engine-element";
import { useModelEditStore } from "./model-edit-store";
import type { ModelEditSession } from "./use-model-edit-session.types";

/**
 * Runs an editor's live model edits: the element action `MODEL_ACTIONS.edit` starts one (its kind
 * must be a `ModelKind`), and it finishes when the element leaves the selection or goes, and when
 * the editor unmounts. Returns the model live in this editor, or `null`.
 */
export function useModelEditSession(engine: CanvasEngine<object>): ModelEditSession | null {
  const id = useModelEditStore((state) => (state.engine === engine ? state.id : null));
  const data = useModelEditStore((state) => (state.engine === engine ? state.data : null));
  const element = useEngineElement(id);
  const selectedIds = useEngineState((state) => state.selectedIds);

  useEffect(
    () =>
      engine.onElementAction(({ elementId, action }) => {
        if (action !== MODEL_ACTIONS.edit) return;
        const target = engine.getElement(elementId);
        const kind = target ? engine.kinds.kindOf(target) : null;
        if (!target || !isModelKind(kind)) return;
        useModelEditStore.getState().start(engine, elementId, kind.modelData(target));
      }),
    [engine],
  );

  useEffect(() => {
    if (id && (!element || !selectedIds.includes(id))) {
      void useModelEditStore.getState().stopIn(engine);
    }
  }, [engine, id, element, selectedIds]);

  useEffect(
    () => () => {
      void useModelEditStore.getState().stopIn(engine);
    },
    [engine],
  );

  // The kind skips the saved picture while the model is live (`isModelLive`): redraw it when the
  // edit starts and when it ends.
  useEffect(() => {
    if (!id) return;
    const redraw = () => {
      try {
        if (engine.getElement(id)) engine.refreshElements([id]);
      } catch {
        // The editor is closing: there is no canvas left to redraw.
      }
    };
    redraw();
    return redraw;
  }, [engine, id]);

  if (!id || !element || !data) return null;
  const { x, y, w, h, rotation = 0, mirrored } = element;
  return { id, element, data, frame: { x, y, w, h, rotation, mirrored } };
}
