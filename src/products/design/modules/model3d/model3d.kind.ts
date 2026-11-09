import {
  rejectViewPatch,
  type ElementBuildContext,
  type ElementDescription,
  type ElementPatch,
  type ElementView,
  type ModelData,
  type ModelKind,
} from "@canvas";

import {
  DesignNodeKind,
  drawPaints,
  EMPTY_GEOMETRY,
  imagePaint,
  networkGeometry,
  rectNetwork,
  type NodeGeometry,
} from "../core";
import { MODEL_NODE_DEFAULTS, MODEL_STORED_FIELDS } from "./model3d.defaults";
import { t } from "./model3d.i18n";
import type { ModelNodeElement } from "./model3d.types";

/**
 * A 3D model layer. At rest it is its saved picture (`pictureAssetId`) fitted in its box; the
 * live 3D view is an overlay the editor mounts while it is edited (the engine covers the picture
 * on screen meanwhile). It resizes freely, the picture fitted inside its box until the next edit
 * draws it for the box's shape, and takes no fills or strokes. `angle` is the model's turn;
 * the layer's own `rotation` turns the picture like any layer.
 */
export class ModelNodeKind extends DesignNodeKind<ModelNodeElement> implements ModelKind {
  readonly type = "model3d";
  readonly label = t("label");
  readonly description = t("description");
  override readonly defaults = MODEL_NODE_DEFAULTS;
  override readonly fillable = false;
  override readonly strokable = false;
  override readonly imageFills = false;

  modelData(el: ModelNodeElement): ModelData {
    return el;
  }

  draw(view: ElementView, el: ModelNodeElement): void {
    const shown = { ...el, fills: [imagePaint(el.pictureAssetId, "fit")], strokes: [] };
    drawPaints(view, shown, this.geometry(el) ?? EMPTY_GEOMETRY, null);
  }

  protected override buildGeometry(el: ModelNodeElement): NodeGeometry {
    return networkGeometry(rectNetwork(el.w, el.h, 0), false);
  }

  /** Its picture flips with it (`mirrored`), as pictures do. */
  override mirrorsOnFlip(): boolean {
    return true;
  }

  override assets(el: ModelNodeElement): string[] {
    return [el.pictureAssetId];
  }

  override describe(el: ModelNodeElement): ElementDescription {
    return { label: this.layerName(el), kind: el.fileName };
  }

  /** Agents move and resize it and set its view; its files only the model tools write. */
  override completePatch(
    el: ModelNodeElement,
    patch: ElementPatch<ModelNodeElement>,
    context: ElementBuildContext,
  ): ElementPatch<ModelNodeElement> {
    rejectViewPatch(patch, "model3d_view_set");
    const stored = MODEL_STORED_FIELDS.find((field) => field in patch);
    if (stored) {
      throw new Error(`A model's "${stored}" can't be patched: use model3d_view_set.`);
    }
    return super.completePatch(el, patch, context);
  }
}
