import {
  asUndoStep,
  DOCUMENT_TOKENS,
  optionalString,
  recordList,
  stringArg,
  stringList,
  type DocumentTokens,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import {
  fromNodeBindings,
  newStyleValue,
  readStyleBindings,
  readStyleType,
  readStyleValue,
  requireStyle,
  STYLE_TYPES,
  STYLE_VALUE_HELP,
} from "./style-args";

const BINDINGS = {
  type: "object",
  description:
    'Variables driving parts of the value, by path in it: { "paints.0.color": "brand/500", ' +
    '"effects.0.blur": "blur/md" } (null unlinks). They resolve in each layer\'s modes.',
  additionalProperties: { type: ["string", "null"] },
};

/** Binds the parts of a style an agent named (after its value is written). */
function writeBindings(
  tokens: DocumentTokens,
  styleId: string,
  bindings: Map<string, string | null>,
): void {
  for (const [path, variable] of bindings) {
    tokens.bindStyleField(styleId, path, variable, { checkpoint: false });
  }
}

/** Making, changing and deleting styles. */
export const stylesEditTools: DesignAgentTool[] = [
  {
    name: "create_styles",
    description:
      "Adds styles, as one undo step. Each: type (text, paint, effect, stroke), name (a slash " +
      'path like "Heading/H1"), and its value from `fromNode` (a layer\'s look, with the variables ' +
      "it uses there) and/or `value` " +
      `(fields over it; missing ones are defaults). ${STYLE_VALUE_HELP} Returns their ids.`,
    inputSchema: {
      type: "object",
      required: ["styles"],
      properties: {
        styles: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "name"],
            properties: {
              type: { type: "string", enum: STYLE_TYPES },
              name: { type: "string" },
              description: { type: "string" },
              fromNode: { type: "string", description: "A layer id to take the look from." },
              value: { type: "object" },
              bindings: BINDINGS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const specs = recordList(args, "styles").map((item) => {
        const styleType = readStyleType(item.type);
        return {
          styleType,
          name: stringArg(item, "name"),
          description: optionalString(item, "description"),
          value: newStyleValue(engine, styleType, item),
          nodeBindings: fromNodeBindings(engine, styleType, item),
          bindings: readStyleBindings(tokens.store(), item.bindings),
        };
      });
      const made = asUndoStep(engine.doc, () =>
        specs.map(({ bindings, nodeBindings, ...spec }) => {
          // The layer's variables come along; `bindings` given here go over them.
          const style = tokens.createStyle({ ...spec, bindings: nodeBindings });
          writeBindings(tokens, style.id, bindings);
          return style;
        }),
      );
      return { created: made.map((s) => ({ id: s.id, name: s.name })) };
    },
  },
  {
    name: "update_styles",
    description:
      "Changes styles (by id or name), as one undo step: name, description, `value` fields " +
      `(merged over the current ones) and \`bindings\`. ${STYLE_VALUE_HELP} The layers using ` +
      "them follow in the same step.",
    inputSchema: {
      type: "object",
      required: ["styles"],
      properties: {
        styles: {
          type: "array",
          items: {
            type: "object",
            required: ["style"],
            properties: {
              style: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              value: { type: "object" },
              bindings: BINDINGS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const plan = recordList(args, "styles").map((item) => {
        const style = requireStyle(tokens.store(), stringArg(item, "style"));
        return {
          id: style.id,
          patch: {
            name: optionalString(item, "name"),
            description: optionalString(item, "description"),
            ...(item.value === undefined
              ? {}
              : { value: readStyleValue(style.styleType, item.value) }),
          },
          bindings: readStyleBindings(tokens.store(), item.bindings),
        };
      });
      asUndoStep(engine.doc, () => {
        for (const { id, patch, bindings } of plan) {
          tokens.updateStyle(id, patch, { checkpoint: false });
          writeBindings(tokens, id, bindings);
        }
      });
      return { updated: plan.length };
    },
  },
  {
    name: "delete_styles",
    description:
      "Deletes styles (by id or name), as one undo step; layers using them keep their look, " +
      "unlinked.",
    inputSchema: {
      type: "object",
      required: ["styles"],
      properties: { styles: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const ids = stringList(args, "styles").map((ref) => requireStyle(tokens.store(), ref).id);
      asUndoStep(engine.doc, () => tokens.deleteStyles(ids));
      return { deleted: ids.length };
    },
  },
];
