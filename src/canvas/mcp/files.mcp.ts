import type { FileType } from "@shared/core";

import {
  ASK_ABOUT_PROJECT,
  fileRefArg,
  isFileCandidates,
  isProjectChoice,
  newFileArgs,
  SEVERAL_FILES_MATCH,
} from "./agent-tabs";
import type { AgentFileOpened, FilesAgentHost } from "./files.mcp.types";
import type { McpToolGroup } from "./mcp-tool-group.types";
import { optionalChoice } from "./tool-args";

const FILE_TYPES: readonly FileType[] = ["board", "design"];

const TYPE_PROPERTY = {
  type: "string",
  enum: [...FILE_TYPES],
  description: '"board" (.cboard) or "design" (.cdesign).',
};

const fileOpened = ({ type, id, name, title, description, path }: AgentFileOpened) => ({
  type,
  id,
  name,
  title,
  description,
  path,
  message: `Opened the ${type} in the tab "${name}"; you now work there.`,
});

/** The tools that need no open file to list, open and create files (`file_recent_list`, …). */
export const filesTools: McpToolGroup<FilesAgentHost, unknown> = {
  id: "files",
  prefix: "file",
  tools: () => [
    {
      name: "recent_list",
      scope: "app",
      description:
        "Boards and designs recently opened or saved in Cloudy Canvas, newest first, with their " +
        "type, title and description when they have one. Give type to list only boards or only " +
        "designs. Files marked missing were moved or deleted and can't be opened.",
      inputSchema: { type: "object", properties: { type: TYPE_PROPERTY } },
      run: async (host, args) => {
        const files = await host.recentFiles(optionalChoice(args, "type", FILE_TYPES));
        return files.map(({ id, type, name, title, description, path, updatedAt, missing }) => ({
          id,
          type,
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
      name: "open",
      scope: "app",
      description:
        "Opens a board or a design in its own tab and moves you there; the user's view doesn't " +
        "change. Give its id (from file_recent_list) or its name: the name is matched " +
        "case-insensitively against the recent files and the files inside the user's projects, " +
        "in both products unless you give type. If several files match, nothing is opened and " +
        "you get the candidates (each with its type): ask the user which one. Unsaved changes " +
        "elsewhere stay unsaved, so save the file there first if needed.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: {
            type: "string",
            description: "The whole name, case-insensitive, of a recent file or one in a project.",
          },
          type: TYPE_PROPERTY,
        },
      },
      run: async (host, args) => {
        const opened = await host.openFile(
          optionalChoice(args, "type", FILE_TYPES),
          fileRefArg(args),
        );
        return isFileCandidates(opened)
          ? { message: SEVERAL_FILES_MATCH, candidates: opened.candidates }
          : fileOpened(opened);
      },
    },
    {
      name: "new",
      scope: "app",
      description:
        "Creates a new empty board or design in its own tab and moves you there; the user's " +
        "view doesn't change. It's a draft the app saves by itself. " +
        "With a name, if a project's name matches the name's words (every word of " +
        "one is among the words of the other, case-insensitive), nothing is created and you " +
        "get matchingProjects: ask the user whether to save it in that project, then call " +
        'again with project set to its id, or "none" for a draft.',
      inputSchema: {
        type: "object",
        required: ["type"],
        properties: {
          type: TYPE_PROPERTY,
          name: { type: "string", description: "The name of the new file." },
          project: {
            type: "string",
            description: 'A project id (from matchingProjects) to create it in, or "none".',
          },
        },
      },
      run: async (host, args) => {
        const type = optionalChoice(args, "type", FILE_TYPES);
        if (type === undefined) throw new Error('"type" is required: "board" or "design".');
        const created = await host.newFile(type, newFileArgs(args));
        return isProjectChoice(created)
          ? { message: ASK_ABOUT_PROJECT, matchingProjects: created.matchingProjects }
          : fileOpened(created);
      },
    },
  ],
};
