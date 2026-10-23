import { asUndoStep, optionalNumber, optionalString, stringList, type ToolArgs } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../agent";
import { layerDestinationAt, moveLayers, type LayerDestination, type LayerPlace } from "../core";

const PLACES: readonly LayerPlace[] = ["above", "below", "inside"];

/** Where `move_layers` puts the layers: next to or into a layer, or into a parent at a position. */
function destinationOf(args: ToolArgs, elements: Parameters<typeof layerDestinationAt>[0]) {
  const given = PLACES.filter((place) => args[place] !== undefined);
  if (given.length > 1) throw new Error(`Give only one of: ${PLACES.join(", ")}.`);
  const [place] = given;
  if (place) {
    const target = optionalString(args, place);
    if (!target) throw new Error(`"${place}" must be a layer id.`);
    return layerDestinationAt(elements, target, place);
  }
  if (!("parent" in args)) {
    throw new Error(
      'Say where: "above", "below" or "inside" a layer, or a "parent" (null: the page).',
    );
  }
  const parent = args.parent;
  if (parent !== null && (typeof parent !== "string" || parent === "")) {
    throw new Error('"parent" must be a layer id, or null for the top of the page.');
  }
  const destination: LayerDestination = {
    parentId: parent,
    position: optionalNumber(args, "position") ?? 0,
  };
  return destination;
}

/** Moving layers in the tree, as dragging them in the Layers tab does. */
export const moveLayersTool: DesignAgentTool = {
  name: "move_layers",
  description:
    "Moves layers in the layer tree as dragging them in the Layers tab does, in one undo step: " +
    "just above or below a layer (its sibling), on top inside a frame, section, group or boolean " +
    "(`inside`), or into a `parent` (null: the top of the page) at a `position` counted topmost " +
    "first (0: on top). They keep their order and what they hold; their place on the canvas " +
    "doesn't change. Groups and booleans left empty are removed. Sections only go into sections.",
  inputSchema: {
    type: "object",
    required: ["ids"],
    properties: {
      ids: { type: "array", items: { type: "string" }, description: "The layers to move." },
      above: { type: "string", description: "Put them just above this layer." },
      below: { type: "string", description: "Put them just below this layer." },
      inside: { type: "string", description: "Put them on top inside this layer." },
      parent: {
        type: ["string", "null"],
        description: "Put them into this layer (null: the top of the page), at `position`.",
      },
      position: {
        type: "number",
        description: "With `parent`: 0 is on top, 1 under the topmost child, … (default 0).",
      },
    },
  },
  run: (host, args) => {
    const { engine } = requireDesign(host);
    const ids = requireNodes(engine, stringList(args, "ids"));
    if (ids.length === 0) throw new Error('"ids" is empty.');
    const destination = destinationOf(args, engine.doc.all());
    const moved = asUndoStep(engine.doc, () =>
      moveLayers(engine.doc, engine.kinds, ids, destination),
    );
    return { moved, parentId: destination.parentId };
  },
};
