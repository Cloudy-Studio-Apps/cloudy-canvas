import { requireDesign, type DesignMcpTool } from "../../../mcp";

const NO_ARGS = { type: "object", properties: {} };

export const designFileTools: DesignMcpTool[] = [
  {
    name: "save_design",
    description:
      "Saves the open design to its .cdesign file. A design that was never saved asks the user " +
      "where to save it, so the call returns before the file is written.",
    inputSchema: NO_ARGS,
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
