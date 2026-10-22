import { SCALE_ANCHORS } from "../arrange";
import { elementBounds } from "../elements";
import { unionRects } from "../geometry";
import type { AgentTool, ToolArgs } from "./agent-tool.types";
import type { ArrangeToolsOptions } from "./arrange-tools.types";
import { optionalChoice, optionalNumber, stringList } from "./tool-args";

/**
 * `scale_<noun>`: the Scale tool (K) for agents. Scales elements with their content (font sizes,
 * stroke weights, radii, what's inside them) by a factor or to a width or height, round an
 * anchor of the box round them, as one undo step.
 */
export function scaleTool<H>({ noun, things, resolve }: ArrangeToolsOptions<H>): AgentTool<H> {
  return {
    name: `scale_${noun}`,
    description:
      `Scales ${things} with their content as one undo step, as the Scale tool (K) does: font ` +
      `sizes, stroke weights, corner radii and what's inside them grow or shrink in proportion ` +
      `(update_${noun} with w/h only resizes the box). Give "factor" (2 doubles them), or the ` +
      `"width" or "height" the box round them should take. "anchor" is the point of that box ` +
      `that stays put (top-left by default). Returns the scaled ids.`,
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: { type: "array", items: { type: "string" } },
        factor: { type: "number", description: "Above 0; 1 leaves them as they are." },
        width: { type: "number", description: "The new width of the box round them." },
        height: { type: "number", description: "The new height of the box round them." },
        anchor: { enum: SCALE_ANCHORS },
      },
    },
    run: (host, args) => {
      const { engine, ids } = resolve(host, stringList(args, "ids"));
      const anchor = optionalChoice(args, "anchor", SCALE_ANCHORS) ?? "top-left";
      const box = unionRects(
        ids.flatMap((id) => {
          const el = engine.getElement(id);
          return el ? [elementBounds(engine.kinds.kindOf(el), el)] : [];
        }),
      );
      if (!box) throw new Error(`Give the ids of ${things} to scale.`);
      const factor = scaleFactor(args, box.w, box.h);
      return { scaled: engine.scaleElements(ids, factor, anchor) };
    },
  };
}

/** The factor the arguments ask for: `factor`, or a new width or height of the box. */
function scaleFactor(args: ToolArgs, w: number, h: number): number {
  const factor = optionalNumber(args, "factor");
  const width = optionalNumber(args, "width");
  const height = optionalNumber(args, "height");
  const given = [factor, width, height].filter((value) => value !== undefined);
  if (given.length !== 1) throw new Error('Give one of "factor", "width" or "height".');
  const [value] = given;
  if (!(value! > 0)) throw new Error("The factor, width or height must be above 0.");
  if (width !== undefined) {
    if (w <= 0) throw new Error('They have no width to scale; give "height" or "factor".');
    return width / w;
  }
  if (height !== undefined) {
    if (h <= 0) throw new Error('They have no height to scale; give "width" or "factor".');
    return height / h;
  }
  return value!;
}
