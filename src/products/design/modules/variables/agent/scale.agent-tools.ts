import {
  asUndoStep,
  DEFAULT_SCALE_SETTINGS,
  DOCUMENT_TOKENS,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  stringArg,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { readScopes, requireCollection, requireVariable } from "./variable-args";

/** Number scales (spacing, type sizes), kept linked to their base. */
export const scaleTools: DesignAgentTool[] = [
  {
    name: "generate_scale",
    description:
      'Makes a number scale as variables in a group ("space" → space/xs, sm, md, lg …, the base ' +
      "at md), each step the one before times `ratio` (1.25 by default; 1.2, 1.333, 1.5, 1.618 " +
      "are common), as one undo step. `base` is a number variable (the steps then follow it) or " +
      "a number. `scopes` says what they're for (gap, padding, font-size, corner-radius, …).",
    inputSchema: {
      type: "object",
      required: ["collection", "group", "base"],
      properties: {
        collection: { type: "string", description: "Its id or name." },
        group: { type: "string" },
        base: {
          type: ["string", "number"],
          description: "A number variable (id or name) or a number.",
        },
        ratio: { type: "number" },
        below: { type: "number", description: "Steps below the base (0–5, default 2)." },
        above: { type: "number", description: "Steps above the base (0–7, default 4)." },
        names: { type: "string", enum: ["tshirt", "numeric"] },
        round: { type: "boolean", description: "Whole numbers (default true)." },
        scopes: { type: "array", items: { type: "string" } },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const collection = requireCollection(store, stringArg(args, "collection"));
      const variable =
        typeof args.base === "number" ? null : requireVariable(store, stringArg(args, "base"));
      if (variable && variable.type !== "number")
        throw new Error(`${variable.name} isn't a number variable.`);
      const scale = asUndoStep(engine.doc, () =>
        tokens.saveScale({
          ...DEFAULT_SCALE_SETTINGS,
          collectionId: collection.id,
          group: stringArg(args, "group"),
          baseVar: variable?.id ?? null,
          baseValue: typeof args.base === "number" ? args.base : 16,
          ratio: Math.max(1.01, optionalNumber(args, "ratio") ?? DEFAULT_SCALE_SETTINGS.ratio),
          below: Math.min(
            5,
            Math.max(0, Math.round(optionalNumber(args, "below") ?? DEFAULT_SCALE_SETTINGS.below)),
          ),
          above: Math.min(
            7,
            Math.max(0, Math.round(optionalNumber(args, "above") ?? DEFAULT_SCALE_SETTINGS.above)),
          ),
          names:
            optionalChoice(args, "names", ["tshirt", "numeric"] as const) ??
            DEFAULT_SCALE_SETTINGS.names,
          round: optionalBoolean(args, "round") ?? DEFAULT_SCALE_SETTINGS.round,
          scopes: readScopes(args.scopes) ?? (variable ? variable.scopes : []),
        }),
      );
      const steps = tokens
        .store()
        .variables(collection.id)
        .filter((v) => v.generatorId === scale.id)
        .map((v) => ({ id: v.id, name: v.name }));
      return { scale: scale.id, steps };
    },
  },
];
