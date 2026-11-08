import { asUndoStep } from "../../mcp/as-undo-step";
import type { ElementPatch } from "../../elements";
import { modelSource } from "../model-source";
import { newModelAssetId } from "../model-asset-id";
import type { ModelTextureSlot } from "../model3d.types";
import { assertModelFree } from "./model-free";
import type { SetModelViewOptions } from "./model-agent.types";
import { textureArgs } from "./texture-args";
import { angleArg, zoomArg } from "./view-args";

/**
 * Turns, zooms and re-textures a model for an agent: validates everything and reads the texture
 * files before writing, draws the new picture off screen, checks again that nobody took the model
 * meanwhile and writes the view, the slots and the picture in one undo step.
 */
export async function setModelView(options: SetModelViewOptions) {
  const { engine, el, args, baker, readFile, noun } = options;
  assertModelFree(engine, el.id, noun);
  const angle = angleArg(args);
  const zoom = zoomArg(args);
  const chosen = textureArgs(args, el.textures, true);
  if (!angle && zoom === undefined && chosen.size === 0) {
    throw new Error("Give at least one of angle, zoom or textures.");
  }
  const base = modelSource(engine.doc, el);
  if (!base) throw new Error(`This model's file is not in this ${noun}, so it cannot be changed.`);
  const textures = new Map(base.textures);
  const slots: ModelTextureSlot[] = [];
  const added = new Map<string, Uint8Array>();
  for (const slot of el.textures) {
    const path = chosen.get(slot.name);
    if (path === undefined) {
      slots.push(slot);
    } else if (path === null) {
      textures.delete(slot.name);
      slots.push({ ...slot, assetId: null, embedded: false });
    } else {
      const bytes = await readFile(path);
      textures.set(slot.name, bytes);
      added.set(slot.name, bytes);
      slots.push({ ...slot, assetId: newModelAssetId(), embedded: false });
    }
  }
  const view = { angle: angle ?? el.angle, zoom: zoom ?? el.zoom };
  const missing = slots
    .filter((slot) => slot.file !== null && !slot.embedded && !textures.has(slot.name))
    .map((slot) => slot.name);
  const box = engine.getElement(el.id);
  if (!box) throw new Error(`The model ${el.id} was removed meanwhile.`);
  const picture = await baker.bake({ ...base, textures, missing }, view, box);
  // The awaits above gave the user time: check again before writing.
  assertModelFree(engine, el.id, noun);
  if (!engine.getElement(el.id)) throw new Error(`The model ${el.id} was removed meanwhile.`);
  const pictureAssetId = newModelAssetId();
  engine.doc.addAsset(pictureAssetId, picture);
  for (const slot of slots) {
    const bytes = added.get(slot.name);
    if (bytes && slot.assetId) engine.doc.addAsset(slot.assetId, bytes);
  }
  const patch = { ...view, textures: slots, pictureAssetId };
  asUndoStep(engine.doc, () => engine.doc.update(el.id, patch as ElementPatch));
  return { id: el.id, ...view, missing };
}
