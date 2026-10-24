import {
  asUndoStep,
  DEFAULT_VALUE,
  defaultValueOf,
  DOCUMENT_TOKENS,
  optionalBoolean,
  optionalString,
  recordList,
  stringArg,
  stringList,
  type DocumentTokens,
  type ToolArgs,
  type VariableType,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import {
  findMode,
  readCodeSyntax,
  readScopes,
  readTokenValue,
  requireAxis,
  requireCollection,
  requireVariable,
  SCOPE_NAMES,
  VARIABLE_TYPES,
} from "./variable-args";

const VALUE = {
  description:
    'By its type: a color ("#3A83C9", "#3A83C980" with alpha), a number, a text, true or ' +
    'false; or { "alias": "variable" }.',
};
const VARIABLE_FIELDS = {
  value: {
    ...VALUE,
    description: `Its default value (every mode without its own). ${VALUE.description}`,
  },
  values: {
    type: "object",
    description:
      'Values for modes by name (e.g. { "Dark": "#121212" }); the variable then varies by their axis.',
    additionalProperties: VALUE,
  },
  variesBy: {
    type: ["string", "null"],
    description: "The mode axis it varies by (null: none; its overrides go).",
  },
  scopes: { type: "array", items: { type: "string", enum: SCOPE_NAMES } },
  description: { type: "string" },
  codeSyntax: {
    type: "object",
    properties: { web: { type: "string" }, ios: { type: "string" }, android: { type: "string" } },
  },
  hidden: { type: "boolean" },
};

/** Writes an agent's `variesBy`, `value`, `values` and `clear` on a variable (aliases resolved). */
function writeValues(tokens: DocumentTokens, id: string, item: ToolArgs): void {
  const lookup = (ref: string) => requireVariable(tokens.store(), ref).id;
  const type = requireVariable(tokens.store(), id).type;
  if (item.variesBy !== undefined) {
    const axis =
      item.variesBy === null ? null : requireAxis(tokens.store(), stringArg(item, "variesBy")).id;
    tokens.setVariableAxis(id, axis);
  }
  if (item.value !== undefined)
    tokens.setValue(id, DEFAULT_VALUE, readTokenValue(item.value, lookup, type));
  const values = item.values;
  if (values !== undefined) {
    if (typeof values !== "object" || values === null || Array.isArray(values)) {
      throw new Error('"values" maps mode names to values.');
    }
    for (const [mode, raw] of Object.entries(values)) {
      tokens.setValue(id, findMode(tokens.store(), mode), readTokenValue(raw, lookup, type));
    }
  }
  for (const mode of item.clear === undefined ? [] : stringList(item, "clear")) {
    tokens.clearValue(id, findMode(tokens.store(), mode));
  }
}

/** Creating and changing variables. */
export const variablesEditTools: DesignAgentTool[] = [
  {
    name: "create_variables",
    description:
      "Adds variables to a collection, as one undo step. Each: name (a slash path like " +
      '"brand/primary/500"; groups come from it), type ("color", "number", "string" for text, "boolean"), `value` (its ' +
      "default) and optionally `values` for modes by name (it then varies by their axis). A value " +
      "may alias another variable, also one made earlier in the same call. Returns their ids.",
    inputSchema: {
      type: "object",
      required: ["collection", "variables"],
      properties: {
        collection: { type: "string", description: "Its id or name." },
        variables: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "type", "value"],
            properties: {
              name: { type: "string" },
              type: { type: "string", enum: VARIABLE_TYPES },
              ...VARIABLE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const collection = requireCollection(tokens.store(), stringArg(args, "collection"));
      const items = recordList(args, "variables");
      const created = asUndoStep(engine.doc, () => {
        const made = tokens.createVariables(
          items.map((item) => {
            const type = stringArg(item, "type") as VariableType;
            if (!VARIABLE_TYPES.includes(type)) {
              throw new Error(`"type" is one of ${VARIABLE_TYPES.join(", ")}.`);
            }
            return {
              collectionId: collection.id,
              name: stringArg(item, "name"),
              type,
              value: defaultValueOf(type),
              scopes: readScopes(item.scopes),
              description: optionalString(item, "description"),
              codeSyntax: readCodeSyntax(item.codeSyntax),
              hidden: optionalBoolean(item, "hidden"),
            };
          }),
        );
        // Values second, so they can alias what this call made.
        for (const [i, item] of items.entries()) {
          const variable = made[i];
          if (variable) writeValues(tokens, variable.id, item);
        }
        return made;
      });
      return { created: created.map((v) => ({ id: v.id, name: v.name })) };
    },
  },
  {
    name: "update_variables",
    description:
      "Changes variables (by id or name), as one undo step: name (moving it between groups), " +
      "`value` (default), `values` for modes by name, `clear` (mode names going back to the " +
      "default), variesBy, scopes, description, codeSyntax, hidden. Layers using them update in " +
      "the same step.",
    inputSchema: {
      type: "object",
      required: ["variables"],
      properties: {
        variables: {
          type: "array",
          items: {
            type: "object",
            required: ["variable"],
            properties: {
              variable: { type: "string" },
              name: { type: "string" },
              clear: { type: "array", items: { type: "string" } },
              ...VARIABLE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const items = recordList(args, "variables");
      asUndoStep(engine.doc, () => {
        for (const item of items) {
          const variable = requireVariable(tokens.store(), stringArg(item, "variable"));
          tokens.updateVariable(variable.id, {
            name: optionalString(item, "name"),
            scopes: readScopes(item.scopes),
            description: optionalString(item, "description"),
            hidden: optionalBoolean(item, "hidden"),
            codeSyntax: readCodeSyntax(item.codeSyntax),
          });
          writeValues(tokens, variable.id, item);
        }
      });
      return { updated: items.length };
    },
  },
  {
    name: "delete_variables",
    description:
      "Deletes variables (by id or name), as one undo step. Layers using them keep the values " +
      "they show, no longer linked; returns how many were unlinked.",
    inputSchema: {
      type: "object",
      required: ["variables"],
      properties: { variables: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const ids = stringList(args, "variables").map(
        (ref) => requireVariable(tokens.store(), ref).id,
      );
      const unlinked = new Set(ids.flatMap((id) => tokens.usage(id))).size;
      asUndoStep(engine.doc, () => tokens.deleteVariables(ids));
      return { deleted: ids.length, unlinkedLayers: unlinked };
    },
  },
];
