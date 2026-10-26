import { asUndoStep, stringList } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { addAutoLayout, removeAutoLayout } from "./add-auto-layout";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Adding and removing auto layout, as Shift+A and Alt+Shift+A do. */
export const autoLayoutTools: DesignMcpTool[] = [
  {
    name: "add_auto_layout",
    description:
      "Figma's Add auto layout (Shift+A), in one undo step: frames without one get an auto " +
      "layout guessed from where their layers are (direction, gap, padding, alignment); other " +
      "layers are wrapped in a new auto layout frame that hugs them. Their layers' x/y then " +
      "follow the layout. Tune it with update_nodes (`layout`, children's `sizing`). Returns the " +
      "frames.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const frames = asUndoStep(engine.doc, () =>
        addAutoLayout(engine.doc, ids, engine.elements(), engine.kinds),
      );
      if (frames.length === 0) throw new Error("Nothing to add an auto layout to.");
      return { frames };
    },
  },
  {
    name: "remove_auto_layout",
    description:
      "Removes frames' auto layout (Alt+Shift+A), in one undo step: the frames keep their size " +
      "and their layers stay where they are. Ids without one are ignored.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const frames = asUndoStep(engine.doc, () =>
        removeAutoLayout(engine.doc, ids, engine.elements()),
      );
      if (frames.length === 0) throw new Error("None of these frames has an auto layout.");
      return { frames };
    },
  },
];
