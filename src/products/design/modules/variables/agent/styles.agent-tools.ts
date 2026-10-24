import {
  asUndoStep,
  DOCUMENT_TOKENS,
  optionalString,
  recordList,
  stringArg,
  stringList,
  type StyleRecord,
  type TokenStore,
  type ToolArgs,
} from "@canvas";

import { readTextStyle, TEXT_DEFAULTS, TEXT_STYLE, textStyleSummary } from "../../text";
import { requireDesign, type DesignAgentTool } from "../../../agent";

const TEXT_STYLE_FIELDS = {
  fontFamily: { type: "string" },
  fontSize: { type: "number" },
  fontWeight: { type: "string", description: '"100" … "900".' },
  fontStyle: { type: "string", enum: ["normal", "italic"] },
  lineHeight: { type: "number", description: "A multiple of the font size (1.2)." },
  letterSpacing: { type: "number" },
  textDecoration: { type: "string", enum: ["none", "underline", "strikethrough"] },
};

/** A style by id or a name unique among styles; throws when unknown. */
export function requireStyle(store: TokenStore, ref: string): StyleRecord {
  const style = store.findStyle(ref);
  if (!style) throw new Error(`No style "${ref}". Call list_styles for the names and ids.`);
  return style;
}

/** The typography an agent gave, checked: every field it named must be valid. */
function textStyleArgs(item: ToolArgs): Record<string, unknown> {
  const given = Object.fromEntries(
    Object.keys(TEXT_STYLE_FIELDS)
      .filter((key) => item[key] !== undefined)
      .map((key) => [key, item[key]]),
  );
  const valid = readTextStyle(given);
  const bad = Object.keys(given).filter((key) => !(key in valid));
  if (bad.length > 0) throw new Error(`Invalid text style fields: ${bad.join(", ")}.`);
  return valid;
}

function describeStyle(style: StyleRecord, usage: number) {
  return {
    id: style.id,
    type: style.styleType,
    name: style.name,
    value: style.value,
    ...(style.styleType === TEXT_STYLE ? { summary: textStyleSummary(style) } : {}),
    ...(style.description ? { description: style.description } : {}),
    usedBy: usage,
  };
}

/** Styles (Figma's): text styles for now. Applying one is bind_variables with path "textStyle". */
export const styleTools: DesignAgentTool[] = [
  {
    name: "list_styles",
    description:
      "Lists the design's styles (text styles: typography presets) with their values and how " +
      'many layers use each. Apply one with bind_variables (path "textStyle", the style\'s id ' +
      "or name).",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const tokens = requireDesign(host).engine.service(DOCUMENT_TOKENS);
      return {
        styles: tokens
          .store()
          .styles()
          .map((s) => describeStyle(s, tokens.usage(s.id).length)),
      };
    },
  },
  {
    name: "create_text_styles",
    description:
      'Adds text styles (typography presets), as one undo step: name (a slash path like "Heading/H1") ' +
      "and the fields to save; missing ones are the default text's. Returns their ids.",
    inputSchema: {
      type: "object",
      required: ["styles"],
      properties: {
        styles: {
          type: "array",
          items: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              ...TEXT_STYLE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const specs = recordList(args, "styles").map((item) => ({
        name: stringArg(item, "name"),
        description: optionalString(item, "description"),
        value: { ...TEXT_DEFAULTS.typography, textDecoration: "none", ...textStyleArgs(item) },
      }));
      const made = asUndoStep(engine.doc, () =>
        specs.map((spec) => tokens.createStyle({ styleType: TEXT_STYLE, ...spec })),
      );
      return { created: made.map((s) => ({ id: s.id, name: s.name })) };
    },
  },
  {
    name: "update_text_styles",
    description:
      "Changes text styles (by id or name), as one undo step: name, description and any " +
      "typography field. The texts using them follow in the same step.",
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
              ...TEXT_STYLE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const plan = recordList(args, "styles").map((item) => ({
        id: requireStyle(tokens.store(), stringArg(item, "style")).id,
        patch: {
          name: optionalString(item, "name"),
          description: optionalString(item, "description"),
          value: textStyleArgs(item),
        },
      }));
      asUndoStep(engine.doc, () => {
        for (const { id, patch } of plan) tokens.updateStyle(id, patch);
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
