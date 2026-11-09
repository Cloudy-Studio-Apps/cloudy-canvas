import {
  agentModelReport,
  asUndoStep,
  MODEL_ADD_TOOL,
  optionalString,
  readAgentModel,
  storeModel,
  toModelData,
  type ModelBaker,
  type ModelData,
  type Rect,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { checkParent, containerAt, isNodeKind } from "../../core";
import { createModelNode } from "../model3d.factory";

/** The data of a stand-in layer that only has to be of the right type. */
const EMPTY_MODEL: ModelData = {
  modelAssetId: "",
  mtlAssetId: null,
  format: "glb",
  fileName: "",
  fileSize: 0,
  pictureAssetId: "",
  angle: { x: 0, y: 0, z: 0 },
  zoom: 1,
  textures: [],
};

/**
 * `model3d_add` (shared with boards): places a model file as a 3D model layer, as dropping it does
 * (no dialog).
 */
export function addModelNodeTool(baker: ModelBaker): DesignMcpTool {
  return {
    ...MODEL_ADD_TOOL,
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      if (engine.doc.isReadOnly) throw new Error("This design is read-only.");
      const name = optionalString(args, "name");
      const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
      // A stand-in layer of the same type checks `parent` before any file is read or stored.
      const probe = (rect: Rect, data: ModelData) => createModelNode(data, rect, "a", name);
      const stub = probe({ x: 0, y: 0, w: 1, h: 1 }, EMPTY_MODEL);
      const given =
        "parent" in args && isNodeKind(engine.kinds.kindOf(stub))
          ? checkParent(stub, args.parent, context)
          : undefined;
      const { imp, rect } = await readAgentModel(args, baker, (path) => host.readFile(path));
      const none = { model: "", mtl: null, picture: "", textures: imp.slots.map(() => null) };
      const parentId =
        given !== undefined
          ? given
          : (containerAt(probe(rect, toModelData(imp, none)), engine.elements(), engine.kinds)
              ?.id ?? null);
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
