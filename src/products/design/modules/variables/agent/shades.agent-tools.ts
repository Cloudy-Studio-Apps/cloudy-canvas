import {
  asUndoStep,
  DEFAULT_SHADE_SETTINGS,
  DOCUMENT_TOKENS,
  optionalChoice,
  optionalNumber,
  parseTokenColor,
  requireCollection,
  requireVariable,
  stringArg,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";

/** Shades of a color, kept linked to it (the Variables window's generator). */
export const shadeTools: DesignAgentTool[] = [
  {
    name: "generate_shades",
    description:
      'Makes the lighter and darker shades of a color as variables in a group ("primary" → ' +
      "primary/50 … primary/950, the base at 500), evenly spaced in OKLab, as one undo step. " +
      "`base` is a variable (its shades then follow it when it changes) or a color. With modes, " +
      "the later modes get the shades flipped (`other: flip`, for dark themes) or the same.",
    inputSchema: {
      type: "object",
      required: ["collection", "group", "base"],
      properties: {
        collection: { type: "string", description: "Its id or name." },
        group: { type: "string" },
        base: { type: "string", description: 'A variable (id or name) or a color like "#3A83C9".' },
        steps: { type: "string", enum: ["50-950", "100-900", "5"] },
        lightest: { type: "number", description: "Lightness of the lightest shade, 0.8–0.99." },
        darkest: { type: "number", description: "Lightness of the darkest shade, 0.1–0.45." },
        fade: { type: "number", description: "How much the ends lose saturation, 0–1." },
        other: { type: "string", enum: ["flip", "same"] },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const collection = requireCollection(store, stringArg(args, "collection"));
      const base = stringArg(args, "base");
      const color = parseTokenColor(base);
      const variable = color ? null : requireVariable(store, base);
      const generator = asUndoStep(engine.doc, () =>
        tokens.saveGenerator({
          ...DEFAULT_SHADE_SETTINGS,
          collectionId: collection.id,
          group: stringArg(args, "group"),
          baseVar: variable?.id ?? null,
          baseColor: color ?? "#000000FF",
          steps:
            optionalChoice(args, "steps", ["50-950", "100-900", "5"] as const) ??
            DEFAULT_SHADE_SETTINGS.steps,
          lightest: optionalNumber(args, "lightest") ?? DEFAULT_SHADE_SETTINGS.lightest,
          darkest: optionalNumber(args, "darkest") ?? DEFAULT_SHADE_SETTINGS.darkest,
          fade: optionalNumber(args, "fade") ?? DEFAULT_SHADE_SETTINGS.fade,
          other:
            optionalChoice(args, "other", ["flip", "same"] as const) ??
            DEFAULT_SHADE_SETTINGS.other,
        }),
      );
      const shades = tokens
        .store()
        .variables(collection.id)
        .filter((v) => v.generatorId === generator.id)
        .map((v) => ({ id: v.id, name: v.name }));
      return { generator: generator.id, shades };
    },
  },
];
