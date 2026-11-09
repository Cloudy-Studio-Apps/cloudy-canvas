import type { SharedToolSpec } from "../../mcp/shared/shared-tool.types";
import { MODEL_BASE_SIZE } from "../model3d.constants";
import { ADD_MODEL_PROPERTIES, SET_MODEL_VIEW_PROPERTIES } from "./model-properties";

/** `model3d_add`: places a model file, as dropping it does (no size dialog). */
export const MODEL_ADD_TOOL: SharedToolSpec = {
  name: "add",
  description:
    "Places a 3D model file (GLB, glTF, OBJ with its .mtl, FBX) on the board, or on the page " +
    "you work on in a design as a 3D model layer, as dropping it does, in one undo step. " +
    "Textures next to the file are found by their names; `textures` assigns a picture file to a " +
    "slot by hand. It is shown as a picture of the model (turn it with model3d_view_set, move " +
    `and resize it with shapes_update or nodes_update); it is \`h\` tall (${MODEL_BASE_SIZE} by ` +
    "default) with the width of its framing. In a design it is named after the file unless " +
    "`name` is given, and goes into the frame under its center unless `parent` says where. " +
    "Returns its id, its texture slots, the `missing` ones (shown gray) and, over 10 MB, a " +
    "`warning` that large files can cause problems. A placed model is reused: move or resize it " +
    "and turn it with model3d_view_set instead of adding the file again.",
  inputSchema: {
    type: "object",
    required: ["path"],
    properties: {
      ...ADD_MODEL_PROPERTIES,
      name: { type: "string", description: "Designs only. The layer's name." },
      parent: {
        type: ["string", "null"],
        description: "Designs only. Frame or section to put it in; null for the top of the page.",
      },
    },
  },
};

/** `model3d_view_set`: turns, zooms and re-textures a model, drawing its new picture off screen. */
export const MODEL_VIEW_SET_TOOL: SharedToolSpec = {
  name: "view_set",
  description:
    "Changes how a 3D model is shown: `angle` ({ x, y, z } degrees), `zoom` (0.1 to 10, 1 fits " +
    "it in its box) and `textures` (slot name to an absolute picture path, or null to clear the " +
    "slot). The picture is drawn off screen and everything is one undo step; check the result " +
    'with view_snapshot. Fails with "being edited" while a person has the model open in 3D: ' +
    "wait for them to finish and try again.",
  inputSchema: { type: "object", required: ["id"], properties: SET_MODEL_VIEW_PROPERTIES },
};

/** `model3d_convert_to_png`: the model becomes a plain picture (permanent). */
export const MODEL_CONVERT_TO_PNG_TOOL: SharedToolSpec = {
  name: "convert_to_png",
  description:
    "Turns a 3D model into its current picture, in the same place and size, in one undo step: " +
    "on a board a plain image, in a design a rectangle filled with the picture that keeps the " +
    "layer's settings. The 3D data is forgotten (the file gets lighter once it is closed), so " +
    "only call it when the user asked for it, never on your own. Returns the new element's id. " +
    'Fails with "being edited" while a person has the model open in 3D.',
  inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
};
