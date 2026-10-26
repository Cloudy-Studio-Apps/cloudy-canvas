import {
  asUndoStep,
  describeAxis,
  describeCollection,
  DOCUMENT_TOKENS,
  findMode,
  optionalString,
  recordList,
  requireAxis,
  requireCollection,
  requireMode,
  stringArg,
  stringList,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";

/** Collections (folders of variables) and mode axes. */
export const modesTools: DesignAgentTool[] = [
  {
    name: "create_collection",
    description:
      'Adds a collection: a folder of variables (e.g. "Primitives", "Semantic"). Modes aren\'t ' +
      "a collection's: they're the file's axes (create_mode_axis). Returns its id.",
    inputSchema: { type: "object", required: ["name"], properties: { name: { type: "string" } } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const collection = asUndoStep(engine.doc, () =>
        tokens.createCollection(stringArg(args, "name")),
      );
      return describeCollection(tokens.store(), collection);
    },
  },
  {
    name: "update_collection",
    description: "Renames a collection (by id or name).",
    inputSchema: {
      type: "object",
      required: ["collection", "name"],
      properties: { collection: { type: "string" }, name: { type: "string" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const id = requireCollection(tokens.store(), stringArg(args, "collection")).id;
      asUndoStep(engine.doc, () => tokens.renameCollection(id, stringArg(args, "name")));
      return describeCollection(tokens.store(), requireCollection(tokens.store(), id));
    },
  },
  {
    name: "create_mode_axis",
    description:
      'Adds a mode axis to the file (e.g. "Theme" with ["Light", "Dark"]; axes combine, like ' +
      'Theme × "Brand"). The first mode is the base: variables\' default values are its. ' +
      "Variables vary by an axis once they get a value for one of its other modes. Returns it.",
    inputSchema: {
      type: "object",
      required: ["name", "modes"],
      properties: { name: { type: "string" }, modes: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const axis = asUndoStep(engine.doc, () =>
        tokens.createAxis(stringArg(args, "name"), stringList(args, "modes")),
      );
      return describeAxis(tokens.store(), axis);
    },
  },
  {
    name: "update_mode_axis",
    description:
      "Changes a mode axis (by id or name), as one undo step: rename it, add, rename or remove " +
      "modes, `moveModes` (modes of other axes, by name or id, moved into this one: variables " +
      "varying only by them follow; another axis's first mode can't move), switch the mode the " +
      "whole file shows (`current`; frames set to their own mode keep it), or `remove` the axis " +
      "(its variables keep their defaults).",
    inputSchema: {
      type: "object",
      required: ["axis"],
      properties: {
        axis: { type: "string" },
        name: { type: "string" },
        addModes: { type: "array", items: { type: "string" } },
        renameModes: {
          type: "array",
          items: {
            type: "object",
            required: ["mode", "name"],
            properties: { mode: { type: "string" }, name: { type: "string" } },
          },
        },
        removeModes: { type: "array", items: { type: "string" } },
        moveModes: {
          type: "array",
          items: { type: "string" },
          description: "Modes of other axes to move into this one (name or id).",
        },
        current: { type: "string", description: "A mode name or id." },
        remove: { type: "boolean" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const id = requireAxis(tokens.store(), stringArg(args, "axis")).id;
      if (args.remove === true) {
        asUndoStep(engine.doc, () => tokens.deleteAxis(id));
        return { removed: id };
      }
      const axis = () => requireAxis(tokens.store(), id);
      let dropped = 0;
      asUndoStep(engine.doc, () => {
        const name = optionalString(args, "name");
        if (name) tokens.renameAxis(id, name);
        for (const mode of args.addModes === undefined ? [] : stringList(args, "addModes")) {
          tokens.addMode(id, mode);
        }
        for (const item of args.renameModes === undefined ? [] : recordList(args, "renameModes")) {
          tokens.renameMode(
            id,
            requireMode(axis(), stringArg(item, "mode")),
            stringArg(item, "name"),
          );
        }
        for (const mode of args.removeModes === undefined ? [] : stringList(args, "removeModes")) {
          tokens.removeMode(id, requireMode(axis(), mode));
        }
        for (const mode of args.moveModes === undefined ? [] : stringList(args, "moveModes")) {
          dropped += tokens.moveMode(findMode(tokens.store(), mode), id).dropped;
        }
        const current = optionalString(args, "current");
        if (current) tokens.setCurrentMode(id, requireMode(axis(), current));
      });
      const described = describeAxis(tokens.store(), axis());
      // Variables varying by a mode's old axis in other modes too lost the moved mode's value.
      return dropped > 0 ? { ...described, droppedModeValues: dropped } : described;
    },
  },
];
