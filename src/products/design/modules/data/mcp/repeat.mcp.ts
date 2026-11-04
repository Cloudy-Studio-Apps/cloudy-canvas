import { asUndoStep, stringArg, type ToolArgs } from "@canvas";

import { isDesignNode } from "../../core";
import { requireDesign, type DesignAgentContext, type DesignMcpTool } from "../../../mcp";
import { dataIssues } from "../checks";
import { DESIGN_DATA_SOURCES } from "../model";
import { dataCopyTag, detachDataCopy, repeatLayer, repeatOf, setRepeat } from "../repeat";
import { readRepeatArgs } from "./repeat-args";

const CARD_NOTE =
  "A frame repeats one of its own layers (the card, `template`; the first child when not given) " +
  "once per row of a list, `source` (an expression such as `products`). Design the card with " +
  "bind_data first, reading the row by its name (`as`, `item` by default): `{item.name}`. " +
  "Copies follow the card and the data, are locked and are kept in step by the app; detach one " +
  "(detach_data_copy) to edit it by hand.";

const OPTIONS = {
  source: { type: "string", description: "The list to repeat for: `products`, `product.specs`." },
  as: { type: "string", description: "The row's name inside the card, `item` by default." },
  key: {
    type: ["string", "null"],
    description: "A path in the row (`item.id`) giving its identity; null uses the position.",
  },
  filter: {
    type: "array",
    description:
      "Rows must satisfy all: [{ path, op: exists|empty|eq|neq|gt|lt|contains, value? }].",
  },
  sort: {
    type: "array",
    description: "[{ path, descending? }] in order, paths like `item.price`.",
  },
  limit: { type: ["number", "null"], description: "Most rows shown everywhere; null removes." },
  designLimit: {
    type: ["number", "null"],
    description: "Most copies made in the design only (exports show all); null removes.",
  },
  previewRow: {
    type: ["number", "null"],
    description: "The row the card itself shows (0 when unset); null clears.",
  },
  addLayout: {
    type: "boolean",
    description: "Give a frame with no auto layout a wrapping row (default true).",
  },
};

/** The frame's repeat and how many copies it holds, as every editing tool answers. */
function repeatResult(host: Parameters<DesignMcpTool["run"]>[0], frameId: string) {
  const { engine } = requireDesign(host);
  const frame = engine.doc.get(frameId);
  const copies = engine.doc
    .all()
    .filter(
      (el) =>
        dataCopyTag(el)?.iterator === frameId && engine.doc.field(el.id, "parentId") === frameId,
    ).length;
  return { frame: frameId, repeat: frame ? repeatOf(frame) : null, copies };
}

function layerArg(host: Parameters<DesignMcpTool["run"]>[0], args: ToolArgs, name: string) {
  const { engine } = requireDesign(host);
  const id = stringArg(args, name);
  const el = engine.doc.get(id);
  if (!el || !isDesignNode(el)) throw new Error(`No layer with id ${id}.`);
  return { engine, id };
}

/** Repeats a frame's card for each row of a source. */
export const setRepeatTool = ({ kinds }: DesignAgentContext): DesignMcpTool => ({
  name: "set_repeat",
  description:
    `Makes a frame repeat a card for each row of a data source, or changes its repeat, in one ` +
    `undo step. ${CARD_NOTE} Only what you pass changes (null clears key, limit, designLimit and ` +
    "previewRow); a new `source` is required the first time. Changing `template` swaps the " +
    "card. Returns the repeat settings and `copies`, the number of copies made.",
  inputSchema: {
    type: "object",
    required: ["frame"],
    properties: {
      frame: { type: "string", description: "The frame's id." },
      template: { type: "string", description: "The id of the card, one of the frame's layers." },
      ...OPTIONS,
    },
  },
  run: async (host, args) => {
    const { engine, id } = layerArg(host, args, "frame");
    const { repeat, addLayout } = readRepeatArgs(args);
    asUndoStep(engine.doc, () => setRepeat(engine.doc, id, repeat, { addLayout, kinds }));
    return repeatResult(host, id);
  },
});

/** Repeats a card inside its parent frame. */
export const repeatLayerTool = ({ kinds }: DesignAgentContext): DesignMcpTool => ({
  name: "repeat_layer",
  description:
    "Repeats a layer (the card) for each row of a source, inside its parent frame, which holds " +
    `and lays out the copies: set_repeat on the parent with this layer as \`template\`. ` +
    `${CARD_NOTE} Returns the parent frame's repeat settings and \`copies\`.`,
  inputSchema: {
    type: "object",
    required: ["layer"],
    properties: { layer: { type: "string", description: "The card's id." }, ...OPTIONS },
  },
  run: async (host, args) => {
    const { engine, id } = layerArg(host, args, "layer");
    const { repeat, addLayout } = readRepeatArgs(args);
    asUndoStep(engine.doc, () => repeatLayer(engine.doc, id, repeat, { addLayout, kinds }));
    const parentId = engine.doc.field(id, "parentId");
    return repeatResult(host, typeof parentId === "string" ? parentId : id);
  },
});

/** Stops a frame repeating. */
export const removeRepeatTool: DesignMcpTool = {
  name: "remove_repeat",
  description:
    "Stops a frame repeating and deletes the copies it made (the card stays), in one undo step.",
  inputSchema: {
    type: "object",
    required: ["frame"],
    properties: { frame: { type: "string", description: "The frame's id." } },
  },
  run: async (host, args) => {
    const { engine, id } = layerArg(host, args, "frame");
    asUndoStep(engine.doc, () => setRepeat(engine.doc, id, null));
    return repeatResult(host, id);
  },
};

/** Detaches a copy so it can be edited by hand. */
export const detachDataCopyTool: DesignMcpTool = {
  name: "detach_data_copy",
  description:
    "Detaches a copy a repeat made (its root or a layer inside it), in one undo step: it keeps " +
    "what it shows now, is unlocked and unlinked from its row and the card, and the repeat " +
    "never updates or replaces it again.",
  inputSchema: {
    type: "object",
    required: ["layer"],
    properties: { layer: { type: "string", description: "The copy's id, or a layer in it." } },
  },
  run: async (host, args) => {
    const { engine, id } = layerArg(host, args, "layer");
    asUndoStep(engine.doc, () => detachDataCopy(engine.doc, id));
    return { layer: id, detached: true };
  },
};

/** The data that doesn't fit. */
export const dataIssuesTool = ({ kinds }: DesignAgentContext): DesignMcpTool => ({
  name: "get_data_issues",
  description:
    "Lists the data that doesn't fit: bound expressions that read nothing, texts taller than " +
    "their box, repeats with too many copies or stacked copies, detached rows gone from the " +
    "list, and sources whose update failed or never ran. Each has a kind, the layer " +
    "(`nodeId`), the source and a detail. `source` limits it to one source's id. Returns " +
    "`{ issues, truncated }`.",
  inputSchema: {
    type: "object",
    properties: { source: { type: "string", description: "A data source's id." } },
  },
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const only =
      args.source === undefined || args.source === null ? null : stringArg(args, "source");
    const found = dataIssues(engine.doc, { sources: engine.service(DESIGN_DATA_SOURCES), kinds });
    return {
      issues: only ? found.issues.filter((issue) => issue.sourceId === only) : found.issues,
      truncated: found.truncated,
    };
  },
});
