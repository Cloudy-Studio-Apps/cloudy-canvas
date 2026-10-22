import { asUndoStep, optionalString, stringList, type ElementPatch } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../agent";
import { groupNodes, ungroupNodes } from "./group-nodes";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Grouping, as Ctrl+G and Ctrl+Shift+G do. */
export const groupTools: DesignAgentTool[] = [
  {
    name: "group_nodes",
    description:
      'Puts layers into a new group (named "Group 2" unless `name` is given) where the topmost ' +
      "of them was, as Ctrl+G does, in one undo step. The group's bounds follow its layers, and a " +
      "click on one of them selects the group. Returns the group's id.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: IDS_SCHEMA, name: { type: "string" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const name = optionalString(args, "name");
      const group = asUndoStep(engine.doc, () => {
        const id = groupNodes(engine.doc, ids, engine.elements(), engine.kinds);
        if (id && name) engine.doc.update(id, { name } as ElementPatch);
        return id;
      });
      if (!group) throw new Error("Nothing to group.");
      return { group };
    },
  },
  {
    name: "ungroup_nodes",
    description:
      "Dissolves groups, as Ctrl+Shift+G does, in one undo step: their layers go to the group's " +
      "parent. Ids that aren't groups are ignored. Returns the layers that were in them.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const children = asUndoStep(engine.doc, () =>
        ungroupNodes(engine.doc, ids, engine.elements()),
      );
      if (children.length === 0) throw new Error("None of these layers is a group.");
      return { ungrouped: children };
    },
  },
];
