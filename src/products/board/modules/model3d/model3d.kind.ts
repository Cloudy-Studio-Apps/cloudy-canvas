import {
  BoxKind,
  ELEMENT_DEFAULTS,
  checkViewPatch,
  type ElementPatch,
  type ElementView,
  type ModelData,
  type ModelKind,
  type Rect,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { MODEL_DEFAULTS, MODEL_PATCHABLE_FIELDS } from "./model3d.defaults";
import type { ModelElement } from "./model3d.types";
import { t } from "./model3d.i18n";

/**
 * A 3D model. At rest it is its saved picture (`pictureAssetId`); the live 3D view is an overlay
 * the editor mounts while it is edited (the engine covers the picture on screen meanwhile). It keeps its
 * proportions, and agents move and resize it and set its view (`angle`, `zoom`), but never create
 * it with the shape tools.
 */
export class Model3dKind extends BoxKind<ModelElement, BoardToolOptions> implements ModelKind {
  readonly type = "model3d";
  readonly label = t("label");
  readonly description = t("description");
  override readonly defaults = MODEL_DEFAULTS;
  override readonly creatable = false;
  override readonly keepsRatio = true;
  override readonly patchableFields = MODEL_PATCHABLE_FIELDS;

  modelData(el: ModelElement): ModelData {
    return el;
  }

  draw(view: ElementView, el: ModelElement): void {
    view.graphics.clear();
    view.placeImage(el.pictureAssetId, { x: 0, y: 0, w: el.w, h: el.h });
  }

  override assets(el: ModelElement): string[] {
    return [el.pictureAssetId];
  }

  override resize(_el: ModelElement, rect: Rect): ElementPatch<ModelElement> {
    const min = ELEMENT_DEFAULTS.minSize;
    return { x: rect.x, y: rect.y, w: Math.max(min, rect.w), h: Math.max(min, rect.h) };
  }

  override completePatch(
    _el: ModelElement,
    patch: ElementPatch<ModelElement>,
  ): ElementPatch<ModelElement> {
    return checkViewPatch(patch);
  }
}
