import {
  ADD_MODEL_PROPERTIES,
  agentModelReport,
  asUndoStep,
  MODEL_BASE_SIZE,
  optionalString,
  readAgentModel,
  storeModel,
  toModelData,
  type ModelBaker,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { checkParent, containerAt, isNodeKind } from "../../core";
import { createModelNode } from "../model3d.factory";

/** `add_model_node`: places a model file as a 3D model layer, as dropping it does (no dialog). */
export function addModelNodeTool(baker: ModelBaker): DesignMcpTool {
  return {
    name: "add_model_node",
    description:
      "Places a 3D model file (GLB, glTF, OBJ with its .mtl, FBX) on the design as a 3D model " +
      "layer, as dropping it does, in one undo step. Textures next to the file are found by " +
      "their names; `textures` assigns a picture file to a slot by hand. It is shown as a " +
      "picture of the model (turn it with set_model_node_view, move and resize it with " +
      `update_nodes); it is \`h\` tall (${MODEL_BASE_SIZE} by default) with the width of its ` +
      "framing, named after the file unless `name` is given, and goes into the frame under its " +
      "center unless `parent` says where. Returns its id, its texture slots, the `missing` ones " +
      "(shown gray) and, over 10 MB, a `warning` that large files can cause problems.",
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: {
        ...ADD_MODEL_PROPERTIES,
        name: { type: "string" },
        parent: {
          type: ["string", "null"],
          description: "Frame or section to put it in; null for the top of the page.",
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      if (engine.doc.isReadOnly) throw new Error("This design is read-only.");
      const { imp, rect } = await readAgentModel(args, baker, (path) => host.readFile(path));
      const name = optionalString(args, "name");
      // A stand-in with the same type and box checks the place before anything is stored.
      const none = { model: "", mtl: null, picture: "", textures: imp.slots.map(() => null) };
      const probe = createModelNode(toModelData(imp, none), rect, "a", name);
      const kind = engine.kinds.kindOf(probe);
      const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
      const parentId =
        "parent" in args && isNodeKind(kind)
          ? checkParent(probe, args.parent, context)
          : (containerAt(probe, engine.elements(), engine.kinds)?.id ?? null);
      const stored = await storeModel(baker, imp, rect, engine.doc);
      // The bake took time: check again before writing.
      if (engine.doc.isReadOnly) throw new Error("This design is read-only.");
      if (parentId && !engine.getElement(parentId)) {
        throw new Error(`The layer ${parentId} was removed meanwhile.`);
      }
      const node = { ...createModelNode(stored, rect, engine.doc.nextIndex(), name), parentId };
      asUndoStep(engine.doc, () => engine.doc.add(node));
      return { id: node.id, parentId, ...agentModelReport(stored, imp, "design"), ...rect };
    },
  };
}
