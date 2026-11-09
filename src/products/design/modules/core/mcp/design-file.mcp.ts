import {
  ASK_ABOUT_PROJECT,
  fileRefArg,
  isFileCandidates,
  isProjectChoice,
  newFileArgs,
  SEVERAL_FILES_MATCH,
} from "@canvas";

import { requireDesign, type AgentDesign, type DesignMcpTool } from "../../../mcp";

const NO_ARGS = { type: "object", properties: {} };

const NAME_PROPERTY = {
  type: "string",
  description: "The whole name, case-insensitive, of a recent design or a design inside a project.",
};

export const designFileTools: DesignMcpTool[] = [
  {
    name: "list_recent_designs",
    scope: "app",
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
    scope: "app",
    description:
      "Opens a design in its own tab and moves you there; the user's view doesn't change. Give " +
      "its id (from list_recent_designs) or its name: the name is matched case-insensitively " +
      "against the recent designs and the designs inside the user's projects. If several " +
      "designs match, nothing is opened and you get the candidates: ask the user which one. " +
      "Unsaved changes elsewhere stay unsaved, so call save_design first if needed.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: NAME_PROPERTY },
    },
    run: async (host, args) => {
      const opened = await host.openDesign(fileRefArg(args));
      return isFileCandidates(opened)
        ? { message: SEVERAL_FILES_MATCH, candidates: opened.candidates }
        : designInfo(opened);
    },
  },
  {
    name: "new_design",
    scope: "app",
    description:
      "Creates a new empty design in its own tab and moves you there; the user's view doesn't " +
      "change. It's a draft the app saves by itself unless you save it with save_design. With " +
      "a name, if a project's name matches the name's words (every word of one is among the " +
      "words of the other, case-insensitive), nothing is created and you get " +
      "matchingProjects: ask the user whether to save it in that project, then call again " +
      'with project set to its id, or "none" for a draft.',
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the new design." },
        project: {
          type: "string",
          description: 'A project id (from matchingProjects) to create it in, or "none".',
        },
      },
    },
    run: async (host, args) => {
      const created = await host.newDesign(newFileArgs(args));
      return isProjectChoice(created)
        ? { message: ASK_ABOUT_PROJECT, matchingProjects: created.matchingProjects }
        : designInfo(created);
    },
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
  const shown = title || name;
  return {
    id,
    name: shown,
    title,
    description,
    path,
    message: `Opened in the tab "${shown}"; you now work there.`,
  };
}
