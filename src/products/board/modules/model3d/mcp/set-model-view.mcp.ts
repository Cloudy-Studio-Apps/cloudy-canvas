import {
  asUndoStep,
  modelSource,
  newModelAssetId,
  stringArg,
  type ElementPatch,
  type ModelBaker,
  type ModelTextureSlot,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { angleArg, assertModelFree, requireModel, zoomArg } from "./model-access";
import { textureArgs } from "./texture-args";

/** `set_model_view`: turns, zooms and re-textures a model, drawing its new picture off screen. */
export function setModelViewTool(baker: ModelBaker): BoardMcpTool {
  return {
    name: "set_model_view",
    description:
      "Changes how a 3D model is shown: `angle` ({ x, y, z } degrees), `zoom` (0.1 to 10, 1 " +
      "fits it in its box) and `textures` (slot name to an absolute picture path, or null to " +
      "clear the slot). The picture is drawn off screen and everything is one undo step; check " +
      'the result with view_board. Fails with "being edited" while a person has the model ' +
      "open in 3D: wait for them to finish and try again.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        angle: {
          type: "object",
          properties: { x: { type: "number" }, y: { type: "number" }, z: { type: "number" } },
        },
        zoom: { type: "number" },
        textures: {
          type: "object",
          additionalProperties: { type: ["string", "null"] },
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const el = requireModel(engine, stringArg(args, "id"));
      assertModelFree(engine, el.id);
      const angle = angleArg(args);
      const zoom = zoomArg(args);
      const chosen = textureArgs(args, el.textures, true);
      if (!angle && zoom === undefined && chosen.size === 0) {
        throw new Error("Give at least one of angle, zoom or textures.");
      }
      const base = modelSource(engine.doc, el);
      if (!base)
        throw new Error("This model's file is not in this board, so it cannot be changed.");
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
          const bytes = await host.readFile(path);
          textures.set(slot.name, bytes);
          added.set(slot.name, bytes);
          slots.push({ ...slot, assetId: newModelAssetId(), embedded: false });
        }
      }
      const view = { angle: angle ?? el.angle, zoom: zoom ?? el.zoom };
      const missing = slots
        .filter((slot) => slot.file !== null && !slot.embedded && !textures.has(slot.name))
        .map((slot) => slot.name);
      const picture = await baker.bake({ ...base, textures, missing }, view, el);
      // The awaits above gave the user time: check again before writing.
      assertModelFree(engine, el.id);
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
    },
  };
}
