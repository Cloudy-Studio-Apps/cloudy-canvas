import {
  asUndoStep,
  MODEL_BASE_SIZE,
  MODEL_SIZE_WARNING_BYTES,
  optionalNumber,
  storeModel,
  stringArg,
  type ModelBaker,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { createModel } from "../model3d.factory";
import { baseName, siblingPath } from "./file-path";
import { textureArgs } from "./texture-args";

/** `add_model`: places a model file as a 3D model, as dropping it does (no size dialog). */
export function addModelTool(baker: ModelBaker): BoardMcpTool {
  return {
    name: "add_model",
    description:
      "Places a 3D model file (GLB, glTF, OBJ with its .mtl, FBX) on the board as a 3D model, as " +
      "dropping it does, in one undo step. Textures next to the file are found by their names; " +
      "`textures` assigns a picture file to a slot by hand. It is shown as a picture of the model " +
      "(turn it with set_model_view, move and resize it with update_shapes); it is `h` tall " +
      `(${MODEL_BASE_SIZE} by default) with the width of its framing. Returns its id, its texture ` +
      "slots, the `missing` ones (shown gray) and, over 10 MB, a `warning` that large files can " +
      "cause problems.",
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: {
        path: { type: "string", description: "Absolute path of the model file." },
        x: { type: "number", description: "Left edge. Default 0." },
        y: { type: "number", description: "Top edge. Default 0." },
        h: { type: "number", description: "Height; the width follows." },
        textures: {
          type: "object",
          description: "Slot name to the absolute path of a picture for that slot.",
          additionalProperties: { type: "string" },
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      if (engine.doc.isReadOnly) throw new Error("This board is read-only.");
      const path = stringArg(args, "path");
      const h = optionalNumber(args, "h") ?? MODEL_BASE_SIZE;
      if (h < 16) throw new Error('"h" must be at least 16.');
      const data = await host.readFile(path);
      const readSibling = async (name: string) =>
        host.readFile(siblingPath(path, name)).catch(() => null);
      const imp = await baker.importModel({ name: baseName(path), path, data }, [], readSibling);
      const chosen = textureArgs(args, imp.slots, false);
      for (const slot of imp.slots) {
        const file = chosen.get(slot.name);
        if (file) slot.data = await host.readFile(file);
      }
      const rect = {
        x: optionalNumber(args, "x") ?? 0,
        y: optionalNumber(args, "y") ?? 0,
        w: Math.max(1, Math.round(h * imp.aspect)),
        h: Math.round(h),
      };
      const stored = await storeModel(baker, imp, rect, engine.doc);
      const model = createModel(stored, rect, engine.doc.nextIndex());
      asUndoStep(engine.doc, () => engine.doc.add(model));
      const missing = stored.textures
        .filter((slot) => slot.file !== null && !slot.embedded && !slot.assetId)
        .map((slot) => slot.name);
      const warning =
        imp.totalBytes > MODEL_SIZE_WARNING_BYTES
          ? `The model and its textures are ${(imp.totalBytes / 1048576).toFixed(1)} MB. Files over 10 MB can make the board slow and its file large.`
          : undefined;
      return {
        id: model.id,
        slots: stored.textures.map((slot) => slot.name),
        missing,
        ...rect,
        ...(warning ? { warning } : {}),
      };
    },
  };
}
