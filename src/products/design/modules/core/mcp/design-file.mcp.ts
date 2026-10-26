import { stringArg } from "@canvas";

import { requireDesign, type AgentDesign, type DesignMcpTool } from "../../../mcp";

const NO_ARGS = { type: "object", properties: {} };

export const designFileTools: DesignMcpTool[] = [
  {
    name: "list_recent_designs",
    description:
      "Designs recently opened or saved in Cloudy Canvas, newest first, with their title and " +
      "description when they have one. Designs marked missing were moved or deleted and can't " +
      "be opened.",
    inputSchema: NO_ARGS,
    run: async (host) => {
      const files = await host.recentFiles();
      return files
        .filter((file) => file.type === "design")
        .map(({ id, name, title, description, path, updatedAt, missing }) => ({
          id,
          name,
          ...(title && { title }),
          ...(description && { description }),
          path,
          updatedAt,
          ...(missing && { missing: true }),
        }));
    },
  },
  {
    name: "open_design",
    description:
      "Opens a design from list_recent_designs in the app window. Unsaved changes on the file " +
      "open now stay unsaved, so save it first if needed.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    run: async (host, args) => designInfo(await host.openDesign(stringArg(args, "id"))),
  },
  {
    name: "new_design",
    description: "Opens a new empty design in the app window. It's saved with save_design.",
    inputSchema: NO_ARGS,
    run: async (host) => designInfo(await host.newDesign()),
  },
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

function designInfo({ id, name, path, engine }: AgentDesign) {
  const { title, description } = engine.doc.meta();
  return { id, name: title || name, title, description, path };
}
