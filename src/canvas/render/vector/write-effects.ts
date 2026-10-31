import { EFFECT_STAGES } from "../effects/effect-stack-filter";
import type { EffectSvgContext } from "../effects/effect-renderer.types";
import type { EffectScopeView } from "../layers/effect-scope-view";
import { rotatePoint } from "../../rotation";
import { cssBlendMode } from "./blend-mode";
import { num } from "./svg-format";
import type { SvgContext } from "./svg-context.types";

const ORIGIN = { x: 0, y: 0 };

/**
 * An effect scope: what it holds under one `<filter>` and its composite, or `null` when one of its
 * effects can't be written (the caller flattens the scope).
 */
export function writeEffectScope(scope: EffectScopeView, w: SvgContext): string | null {
  const body = w.writeChildren(scope);
  const look = scope.look;
  if (!look || !body) return body;
  const { renderers } = look;
  const { effects, rotation, bounds, composite } = look.scope;
  const steps = EFFECT_STAGES.flatMap((stage) =>
    effects.flatMap((effect) => {
      const renderer = renderers.get(effect.type);
      return effect.visible && renderer?.stage === stage ? [{ effect, renderer }] : [];
    }),
  );
  let current = "SourceGraphic";
  let reach = scope.outset;
  const markup: string[] = [];
  for (const [i, { effect, renderer }] of steps.entries()) {
    const context: EffectSvgContext = {
      current,
      result: `e${i}`,
      prefix: `e${i}-`,
      offset: (dx, dy) => rotatePoint({ x: dx, y: dy }, ORIGIN, rotation),
    };
    const written = renderer.svg?.(effect, context);
    if (written === null || written === undefined) return null;
    if (!written) continue;
    markup.push(written);
    current = context.result;
    reach = Math.max(reach, renderer.margin?.(effect) ?? 0);
  }
  const filtered = markup.length > 0 ? withFilter(body, markup.join(""), bounds, reach, w) : body;
  // An opacity handed down is the view's alpha, which the walker writes.
  const opacity = composite && scope.alpha === 1 ? composite.opacity : 1;
  const blend = composite ? cssBlendMode(composite.blendMode) : null;
  const attrs = [
    ...(opacity < 1 ? [`opacity="${num(opacity)}"`] : []),
    ...(blend ? [`style="mix-blend-mode:${blend}"`] : []),
  ];
  return attrs.length > 0 ? `<g ${attrs.join(" ")}>${filtered}</g>` : filtered;
}

function withFilter(
  body: string,
  steps: string,
  bounds: { x: number; y: number; w: number; h: number },
  reach: number,
  w: SvgContext,
): string {
  const id = w.defs.id("f");
  const area = [
    `x="${num(bounds.x - reach)}"`,
    `y="${num(bounds.y - reach)}"`,
    `width="${num(bounds.w + reach * 2)}"`,
    `height="${num(bounds.h + reach * 2)}"`,
  ].join(" ");
  w.defs.add(
    `<filter id="${id}" filterUnits="userSpaceOnUse" ${area}` +
      ` color-interpolation-filters="sRGB">${steps}</filter>`,
  );
  return `<g filter="url(#${id})">${body}</g>`;
}
