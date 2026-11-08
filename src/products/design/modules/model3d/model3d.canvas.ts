import {
  MODEL_ACTIONS,
  unusedModelAssets,
  type CanvasDocument,
  type CanvasElement,
  type ModelData,
} from "@canvas";
import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";
import { EDIT_MODEL_COMMAND, CONVERT_MODEL_COMMAND } from "./model3d.commands";
import { ModelNodeKind } from "./model3d.kind";
import { t } from "./model3d.i18n";

/** Double-click (or Enter) on a model opens its live 3D view (a model without its file can't). */
function editModel(
  el: CanvasElement,
  ctx: { doc: CanvasDocument; activate(id: string, action: string): void },
) {
  if (el.type !== "model3d") return false;
  if (!ctx.doc.isReadOnly && ctx.doc.getAsset((el as CanvasElement & ModelData).modelAssetId)) {
    ctx.activate(el.id, MODEL_ACTIONS.edit);
  }
  return true;
}

/** The model module's canvas side: the kind, double-click, the asset sweep and its commands. */
export function registerModel3dCanvas(host: ModuleHost): void {
  host.contribute(designCanvas.kinds, new ModelNodeKind());
  host.contribute(designCanvas.editElement, editModel);
  host.contribute(designCanvas.assetSweeps, unusedModelAssets);
  host.contribute(
    designCanvas.hostCommands,
    { id: EDIT_MODEL_COMMAND, label: t("commands.edit") },
    { id: CONVERT_MODEL_COMMAND, label: t("commands.convert") },
  );
}
