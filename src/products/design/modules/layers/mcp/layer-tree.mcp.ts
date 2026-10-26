import { optionalString } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";
import { DESIGN_TREE, layerNameOf } from "../../core";
import { layerTreeOf } from "../layer-tree-of";
import { moveLayersTool } from "./move-layers.mcp";

/** The layer tree as the Layers tab shows it, and moving layers in it. */
export const layersTools: DesignMcpTool[] = [
  {
    name: "get_layer_tree",
    description:
      "The design's layer tree as the Layers tab shows it, topmost first: each layer's id, type, " +
      "name and the layers it holds (children). Hidden and locked layers are marked. Pass `root` " +
      "for one layer's subtree.",
    inputSchema: {
      type: "object",
      properties: { root: { type: "string", description: "Only this layer and what it holds." } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const root = optionalString(args, "root");
      if (root) requireNodes(engine, [root]);
      const tree = engine.service(DESIGN_TREE);
      const layers = tree.layers(engine.scope);
      const toNode = layerTreeOf(layers, (node) => layerNameOf(node, engine.kinds));
      const node = root ? tree.node(root) : undefined;
      return node ? toNode(node) : (layers.get(null) ?? []).map(toNode);
    },
  },
  moveLayersTool,
];
