import {
  MODEL_ACTIONS,
  unusedModelAssets,
  type CanvasDocument,
  type CanvasElement,
  type ModelData,
} from "@canvas";
import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { Model3dKind } from "./model3d.kind";

/** Double-click (or Enter) on a model opens its live 3D view (a model without its file can't). */
function editModel(
  el: CanvasElement,
  ctx: { doc: CanvasDocument; activate(id: string, action: string): void },
) {
  if (el.type !== "model3d") return false;
  if (ctx.doc.getAsset((el as CanvasElement & ModelData).modelAssetId)) {
    ctx.activate(el.id, MODEL_ACTIONS.edit);
  }
  return true;
}

/** The model module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerModel3dCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new Model3dKind());
  host.contribute(boardCanvas.editElement, editModel);
  host.contribute(boardCanvas.assetSweeps, unusedModelAssets);
}
