import { generateKeyBetween } from "fractional-indexing";

import {
  asUndoStep,
  creatableTypes,
  elementSpec,
  optionalString,
  recordList,
  stringArg,
} from "@canvas";

import { requireDesign, type DesignAgentContext, type DesignAgentTool } from "../../../agent";
import { checkParent, isNodeKind, type DesignNode, type NodeBuildContext } from "../node";
import { nextLayerName } from "../tools";
import { containerAt } from "../tree";
import { NODE_SPEC_PROPERTIES } from "./node-spec-properties";

/** `create_nodes`, listing the design's creatable types and their fields (plugins' too). */
export const createNodesTool = ({ kinds }: DesignAgentContext): DesignAgentTool => ({
  name: "create_nodes",
  description:
    "Adds layers to the open design as one undo step and returns their ids. Coordinates are " +
    "world units (the design's pixels), x/y the top-left corner, never relative to a parent. A " +
    "layer goes into the frame or section under its center unless `parent` says where; later " +
    "layers in the call are drawn above earlier ones. Colors are hex strings. Groups are made " +
    "with group_nodes and pictures with add_image.",
  // A getter, so the schema lists the types registered when an agent asks (plugins too).
  get inputSchema() {
    return {
      type: "object",
      required: ["nodes"],
      properties: {
        nodes: {
          type: "array",
          items: {
            type: "object",
            required: ["type"],
            properties: {
              type: { enum: creatableTypes(kinds) },
              ...NODE_SPEC_PROPERTIES,
              // Type-specific fields (a frame's preset, a text's font, …).
              ...Object.assign(
                {},
                ...kinds
                  .all()
                  .filter((kind) => kind.creatable)
                  .map((kind) => kind.specProperties),
              ),
            },
          },
        },
      },
    };
  },
  run: (host, args) => {
    const { engine } = requireDesign(host);
    const specs = recordList(args, "nodes");
    // Build everything first, so an invalid spec fails the call before anything is added.
    const built: DesignNode[] = [];
    const keyed = new Map<string, DesignNode>();
    const context: NodeBuildContext = {
      kinds: engine.kinds,
      // A layer by id, or by the key of one made earlier in the call (a parent).
      lookup: (ref) =>
        keyed.get(ref) ?? built.find((el) => el.id === ref) ?? engine.getElement(ref),
      options: engine.options(),
      nameFor: (base) => nextLayerName([...engine.doc.all(), ...built], base),
    };
    let index = engine.doc.nextIndex();
    const created = specs.map((spec, i) => {
      const type = stringArg(spec, "type");
      const kind = engine.kinds.get(type);
      if (!kind?.creatable || !isNodeKind(kind)) {
        throw new Error(
          `Can't create "${type}" layers. Use one of: ${creatableTypes(engine.kinds).join(", ")}.`,
        );
      }
      const node = kind.buildNode(elementSpec(spec), index, context);
      const parentId =
        "parent" in spec
          ? checkParent(node, spec.parent, context)
          : (containerAt(node, [...engine.elements(), ...built], engine.kinds)?.id ?? null);
      index = generateKeyBetween(index, null);
      built.push({ ...node, parentId });
      const key = optionalString(spec, "key");
      if (key) keyed.set(key, built[built.length - 1]!);
      return { index: i, ...(key ? { key } : {}), id: node.id, type, parentId };
    });
    asUndoStep(engine.doc, () => {
      for (const node of built) engine.doc.add(node);
    });
    return { created };
  },
});
