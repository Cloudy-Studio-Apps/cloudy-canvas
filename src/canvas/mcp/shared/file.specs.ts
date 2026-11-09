import type { SharedToolSpec } from "./shared-tool.types";

const NO_ARGS = { type: "object", properties: {} };

/** `file_get`: what the open file is and holds. */
export const FILE_GET_TOOL: SharedToolSpec = {
  name: "get",
  description:
    "The file your tab holds (a board or a design): id, name (its title, or its file name), " +
    "title and description (set with file_info_set; read the description for what the file is " +
    "about), file path, unsaved changes (`dirty`), the user's selection (`selection`) and yours " +
    "(`yourSelection`), your undo state, and `editable` (false when the file is shared with the " +
    "user to view only: then you can only read it). A board also gives its shape counts " +
    "(`shapeCount`, `shapesByType`); a design gives the page you work on (`currentPage`, yours: " +
    "the user may be on another one; see pages_list), its layer counts by type (`nodeCount`, " +
    "`nodesByType`) and how many ruler guides it has (`guides`, see pages_guides_list).",
  inputSchema: NO_ARGS,
};

/** `file_info_set`: the open file's title and description. */
export const FILE_INFO_SET_TOOL: SharedToolSpec = {
  name: "info_set",
  description:
    "Sets the open file's title and/or description, saved in the file. The title is shown " +
    "instead of the file name (the file isn't renamed); the description says what the board or " +
    "design is about. An empty string clears one. Autosave writes it when it's on; otherwise " +
    "call file_save.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "The file's title." },
      description: { type: "string", description: "What the board or design is about." },
    },
  },
};

/** `file_save`: writes the open file. */
export const FILE_SAVE_TOOL: SharedToolSpec = {
  name: "save",
  description:
    "Saves the open file to its .cboard or .cdesign file. A file that was never saved asks the " +
    "user where to save it, so the call returns before the file is written.",
  inputSchema: NO_ARGS,
};
