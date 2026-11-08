import { useSyncExternalStore } from "react";

import { DEFAULT_MODEL_VIEW, MODEL_EDIT_LOCKS } from "@canvas";
import type { ModelData } from "@canvas";
import type { CanvasEngine } from "@canvas";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";

import { useModelEditStore } from "../live";
import { t } from "../model3d.i18n";
import { hasModelData } from "./has-model-data";
import type { ModelPanelState } from "./model-panel.types";

/** The model panel's values (the live draft, else the element's) and how it changes them. */
export function useModelPanel(
  engine: CanvasEngine<object>,
  id: string,
  data: ModelData,
): ModelPanelState {
  const draft = useModelEditStore((state) =>
    state.engine === engine && state.id === id ? state.draft : null,
  );
  const locks = engine.service(MODEL_EDIT_LOCKS);
  const holder = useSyncExternalStore(locks.onChange.bind(locks), () => locks.holderOf(id));
  const holderName = useCollaboratorsStore((state) =>
    holder && holder !== "self" ? (state.collaborators[holder]?.name ?? null) : null,
  );

  let reason: string | null = null;
  if (engine.doc.isReadOnly) reason = t("panel.readOnly");
  else if (holder !== null && holder !== "self")
    reason = t("panel.heldBy", { name: holderName ?? t("panel.someone") });
  else if (!hasModelData(engine.doc, data)) reason = t("panel.noData");

  const edit = () => useModelEditStore.getState().start(engine, id, data);
  const change: ModelPanelState["change"] = (patch) => {
    edit();
    useModelEditStore.getState().change(patch);
  };

  return {
    angle: draft?.angle ?? data.angle,
    zoom: draft?.zoom ?? data.zoom,
    textures: draft?.textures ?? data.textures,
    live: draft !== null,
    editable: reason === null,
    reason,
    change,
    edit,
    reset: () => change({ angle: { ...DEFAULT_MODEL_VIEW.angle }, zoom: DEFAULT_MODEL_VIEW.zoom }),
  };
}
