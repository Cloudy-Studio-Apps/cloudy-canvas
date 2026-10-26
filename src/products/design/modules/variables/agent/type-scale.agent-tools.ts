import {
  asUndoStep,
  DOCUMENT_TOKENS,
  type FontWeight,
  optionalNumber,
  optionalString,
  requireCollection,
  stringArg,
  type ToolArgs,
} from "@canvas";
import { FONT_WEIGHTS } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { createTypeScale, DEFAULT_TYPE_SCALE, type TypeScaleFont } from "../type-scale";

function weight(args: ToolArgs, key: string, fallback: FontWeight): FontWeight {
  const value = optionalString(args, key);
  if (value === undefined) return fallback;
  if (!FONT_WEIGHTS.includes(value as FontWeight)) {
    throw new Error(`"${key}" is one of ${FONT_WEIGHTS.join(", ")}.`);
  }
  return value as FontWeight;
}

/** Making a type scale. */
export const typeScaleTools: DesignAgentTool[] = [
  {
    name: "generate_type_scale",
    description:
      "Makes a type scale as one undo step: font sizes as a number scale (group/xs … group/4xl, " +
      "scope font-size, the base at md; editing its base or ratio later regenerates them) and a " +
      'text style per step ("Type/xs" …) whose size is bound to its step, so styles and texts ' +
      "follow the scale. Steps above md are headings (headingWeight, heading line height). " +
      "`font` is a family name or a font-family text variable (followed).",
    inputSchema: {
      type: "object",
      required: ["collection"],
      properties: {
        collection: { type: "string", description: "Where the size variables go (id or name)." },
        group: { type: "string", description: 'Default "type".' },
        base: { type: "number", description: "Body size in px at md (16 by default)." },
        ratio: {
          type: "number",
          description: "1.25 by default; 1.2, 1.333, 1.5, 1.618 are common.",
        },
        below: { type: "number", description: "Steps below md (0–5, default 2)." },
        above: { type: "number", description: "Steps above md (0–7, default 5)." },
        font: {
          type: "string",
          description: "A family name, or a font-family variable (id or name).",
        },
        headingWeight: { type: "string", description: '"700" by default.' },
        bodyWeight: { type: "string", description: '"400" by default.' },
        headingLineHeight: { type: "number", description: "A multiple; 1.2 by default." },
        bodyLineHeight: { type: "number", description: "A multiple; 1.5 by default." },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const collection = requireCollection(store, stringArg(args, "collection"));
      const fontRef = optionalString(args, "font");
      const fontVariable = fontRef ? store.find(fontRef) : undefined;
      const font: TypeScaleFont =
        fontVariable && fontVariable.type === "string"
          ? { variable: fontVariable.id }
          : { name: fontRef ?? "Inter" };
      const clampInt = (v: number | undefined, d: number, max: number) =>
        Math.max(0, Math.min(max, Math.round(v ?? d)));
      const made = asUndoStep(engine.doc, () =>
        createTypeScale(engine.doc, tokens, {
          ...DEFAULT_TYPE_SCALE,
          collection: collection.id,
          group: optionalString(args, "group") ?? DEFAULT_TYPE_SCALE.group,
          base: optionalNumber(args, "base") ?? DEFAULT_TYPE_SCALE.base,
          ratio: optionalNumber(args, "ratio") ?? DEFAULT_TYPE_SCALE.ratio,
          below: clampInt(optionalNumber(args, "below"), DEFAULT_TYPE_SCALE.below, 5),
          above: clampInt(optionalNumber(args, "above"), DEFAULT_TYPE_SCALE.above, 7),
          font,
          headingWeight: weight(args, "headingWeight", DEFAULT_TYPE_SCALE.headingWeight),
          bodyWeight: weight(args, "bodyWeight", DEFAULT_TYPE_SCALE.bodyWeight),
          lineHeight: {
            heading:
              optionalNumber(args, "headingLineHeight") ?? DEFAULT_TYPE_SCALE.lineHeight.heading,
            body: optionalNumber(args, "bodyLineHeight") ?? DEFAULT_TYPE_SCALE.lineHeight.body,
          },
        }),
      );
      const now = tokens.store();
      return {
        scale: made.scale,
        styles: made.styles.map((id) => ({ id, name: now.style(id)?.name ?? id })),
      };
    },
  },
];
