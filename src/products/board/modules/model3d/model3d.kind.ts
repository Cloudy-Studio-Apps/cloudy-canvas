import {
  BoxKind,
  ELEMENT_DEFAULTS,
  isModelLive,
  ZOOM_RANGE,
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
 * the editor mounts while it is edited, and the picture is not drawn under it. It keeps its
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
    if (isModelLive(el.id)) return view.clearImage();
    view.placeImage(el.pictureAssetId, { x: 0, y: 0, w: el.w, h: el.h });
  }

  /** Redraws when the model goes live or stops being live. */
  override drawnFrom(el: ModelElement): unknown {
    return isModelLive(el.id);
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
    const { angle, zoom } = patch;
    if (angle !== undefined && !isAngle(angle)) {
      throw new Error('"angle" must be { x, y, z }, finite numbers in degrees.');
    }
    if (zoom !== undefined && !(Number.isFinite(zoom) && inZoomRange(zoom))) {
      throw new Error(`"zoom" must be between ${ZOOM_RANGE.min} and ${ZOOM_RANGE.max}.`);
    }
    return angle ? { ...patch, angle: { x: angle.x, y: angle.y, z: angle.z } } : patch;
  }
}

function inZoomRange(zoom: number): boolean {
  return zoom >= ZOOM_RANGE.min && zoom <= ZOOM_RANGE.max;
}

function isAngle(value: unknown): value is { x: number; y: number; z: number } {
  const angle = value as Partial<Record<"x" | "y" | "z", unknown>> | null;
  return (
    typeof angle === "object" &&
    angle !== null &&
    (["x", "y", "z"] as const).every((axis) => Number.isFinite(angle[axis]))
  );
}
