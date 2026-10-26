import {
  describeAxis,
  describeCollection,
  describeVariable,
  DOCUMENT_TOKENS,
  optionalString,
  requireCollection,
  requireVariable,
  stringList,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";

/** Reading the design's variables. */
export const variablesReadTools: DesignMcpTool[] = [
  {
    name: "list_variables",
    description:
      "Lists the design's variables: the file's mode axes (each with its modes, the first the " +
      "base, and the one shown), collections (folders) and each variable with its name (a slash " +
      'path: groups), type (color or number), default `value` (a color "#RRGGBBAA", a number, or ' +
      "{ alias }), the axis it varies by with its overrides per mode, scopes, description, code " +
      "syntax and how many layers use it. `collection` (id or name) lists one collection.",
    inputSchema: {
      type: "object",
      properties: { collection: { type: "string" } },
    },
    run: (host, args) => {
      const tokens = requireDesign(host).engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const ref = optionalString(args, "collection");
      const collections = ref ? [requireCollection(store, ref)] : store.collections();
      return {
        axes: store.axes().map((a) => describeAxis(store, a)),
        collections: collections.map((c) => describeCollection(store, c)),
        variables: collections.flatMap((c) =>
          store.variables(c.id).map((v) => describeVariable(store, v, tokens.usage(v.id).length)),
        ),
      };
    },
  },
  {
    name: "get_variables",
    description:
      'Reads variables by id, "Collection/path" or a path unique in the design, with the ids of ' +
      "the layers using each.",
    inputSchema: {
      type: "object",
      required: ["variables"],
      properties: { variables: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const tokens = requireDesign(host).engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      return {
        variables: stringList(args, "variables").map((ref) => {
          const variable = requireVariable(store, ref);
          const users = tokens.usage(variable.id);
          return { ...describeVariable(store, variable, users.length), layers: users };
        }),
      };
    },
  },
];
