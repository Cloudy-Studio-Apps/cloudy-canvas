import {
  asUndoStep,
  FILE_GET_TOOL,
  FILE_INFO_SET_TOOL,
  FILE_SAVE_TOOL,
  optionalString,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";

/** The design's side of the shared `file` topic: `file_get`, `file_info_set`, `file_save`. */
export const fileTools: DesignMcpTool[] = [
  {
    ...FILE_GET_TOOL,
    run: (host) => {
      const design = requireDesign(host);
      const { engine } = design;
      const nodesByType: Record<string, number> = {};
      for (const el of engine.elements()) nodesByType[el.type] = (nodesByType[el.type] ?? 0) + 1;
      const { title, description } = engine.doc.meta();
      return {
        open: true,
        id: design.id,
        name: title || design.name,
        title,
        description,
        path: design.path,
        dirty: design.dirty,
        editable: !engine.doc.isReadOnly,
        currentPage: engine.scope,
        nodeCount: engine.elements().length,
        nodesByType,
        guides: engine.guides().length,
        selection: engine.userSelection(),
        yourSelection: engine.selectedIds(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      };
    },
  },
  {
    ...FILE_INFO_SET_TOOL,
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const title = optionalString(args, "title");
      const description = optionalString(args, "description");
      if (title === undefined && description === undefined) {
        throw new Error('Give "title", "description" or both.');
      }
      asUndoStep(engine.doc, () => engine.doc.setMeta({ title, description }));
      return engine.doc.meta();
    },
  },
  {
    ...FILE_SAVE_TOOL,
    run: async (host) => {
      const design = requireDesign(host);
      if (!design.path) {
        // The save dialog waits for the user; the editor reports a failed save itself.
        design.save().catch(() => undefined);
        return "Asked the user where to save the design.";
      }
      await design.save();
      return `Saved to ${design.path}.`;
    },
  },
];
