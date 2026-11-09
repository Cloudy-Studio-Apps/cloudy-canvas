import { optionalBoolean, SELECTION_GET_TOOL, SELECTION_SET_TOOL, stringList } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { siblingMasks } from "../tree";
import { summarizeNode } from "./summarize-node";

/** The design's side of the shared `selection` topic: `selection_get`, `selection_set`. */
export const selectionTools: DesignMcpTool[] = [
  {
    ...SELECTION_GET_TOOL,
    run: (host) => {
      const { engine } = requireDesign(host);
      const masked = siblingMasks(engine.elements());
      return engine
        .userSelection()
        .map((id) => engine.getElement(id) ?? engine.doc.get(id))
        .filter((el) => el !== undefined)
        .map((el) => summarizeNode(engine.kinds, el, masked));
    },
  },
  {
    ...SELECTION_SET_TOOL,
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = stringList(args, "ids").filter((id) => engine.getElement(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToElement(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
