import { asUndoStep, modelSource, newModelAssetId } from "@canvas";
import type { CanvasEngine, ElementPatch, ModelData, ModelTextureSlot, Size } from "@canvas";

import { modelBaker } from "../bake";
import { liveKey } from "./live-key";
import { bakeLiveScene, texturesKeyOf } from "./live-model";
import type { ModelDraft } from "./model-edit-store.types";

function sameSlots(a: readonly ModelTextureSlot[], b: readonly ModelTextureSlot[]): boolean {
  return (
    a.length === b.length &&
    a.every((slot, i) => {
      const other = b[i];
      return (
        other !== undefined &&
        slot.name === other.name &&
        slot.file === other.file &&
        slot.assetId === other.assetId &&
        slot.embedded === other.embedded
      );
    })
  );
}

/** Whether the draft differs from the data the edit started from. */
export function draftChanged(data: ModelData, draft: ModelDraft): boolean {
  const { angle } = data;
  return (
    angle.x !== draft.angle.x ||
    angle.y !== draft.angle.y ||
    angle.z !== draft.angle.z ||
    data.zoom !== draft.zoom ||
    !sameSlots(data.textures, draft.textures)
  );
}

/**
 * Writes a finished edit: bakes the picture at the element's current box (from the live scene
 * when it's still kept, else off screen), adds it as a new asset and writes the view, textures
 * and picture as one undo step. Writes nothing when nothing changed, or when the element went or
 * the document became read-only meanwhile. The old picture stays until the asset sweep.
 */
export async function finishModelEdit(
  engine: CanvasEngine<object>,
  id: string,
  data: ModelData,
  draft: ModelDraft,
): Promise<void> {
  if (!draftChanged(data, draft)) return;
  const el = engine.getElement(id);
  if (!el || engine.doc.isReadOnly) return;
  const box = { w: el.w, h: el.h };
  const view = { angle: draft.angle, zoom: draft.zoom };
  const picture =
    (await bakeLiveScene(liveKey(engine, id), texturesKeyOf(draft.textures), view, box)) ??
    (await bakeOffScreen(engine, data, draft, box));
  if (!engine.getElement(id) || engine.doc.isReadOnly) return;
  const pictureAssetId = newModelAssetId();
  engine.doc.addAsset(pictureAssetId, picture);
  const patch: Partial<ModelData> = {
    angle: { ...draft.angle },
    zoom: draft.zoom,
    textures: draft.textures,
    pictureAssetId,
  };
  asUndoStep(engine.doc, () => engine.doc.update(id, patch as ElementPatch));
}

function bakeOffScreen(
  engine: CanvasEngine<object>,
  data: ModelData,
  draft: ModelDraft,
  box: Size,
): Promise<Uint8Array> {
  const source = modelSource(engine.doc, { ...data, textures: draft.textures });
  if (!source) throw new Error("The model's data is missing from this file");
  return modelBaker.bake(source, { angle: draft.angle, zoom: draft.zoom }, box);
}
