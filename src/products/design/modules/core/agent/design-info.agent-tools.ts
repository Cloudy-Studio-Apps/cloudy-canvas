import { asUndoStep, optionalString } from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";

export const designInfoTools: DesignAgentTool[] = [
  {
    name: "set_design_info",
    description:
      "Sets the open design's title and/or description, saved in the design file. The title is " +
      "shown instead of the file name (the file isn't renamed); the description says what the " +
      "design is about. An empty string clears one. Autosave writes it when it's on; otherwise " +
      "call save_design.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The design's title." },
        description: { type: "string", description: "What the design is about." },
      },
    },
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
];
