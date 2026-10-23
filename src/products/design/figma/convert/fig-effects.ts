import type { FigColor, FigEffect, FigImportContext, FigNode } from "@canvas/figma";

import { createEffect, type DesignEffect } from "../../modules";

/**
 * A Figma node's effects, bottom to top as ours are: drop and inner shadows (offset, blur,
 * spread, color, "show behind"), layer blurs (progressive ones too) and background blurs. Other
 * effects are counted in the import's warnings.
 */
export function figEffects(node: FigNode, ctx: FigImportContext): DesignEffect[] {
  const effects: DesignEffect[] = [];
  for (const fig of node.effects ?? []) {
    const effect = figEffect(fig);
    if (effect) effects.push(effect);
    else
      ctx.warnings.add(
        `${(fig.type ?? "unknown").toLowerCase().replace(/_/g, " ")} effects were left out`,
      );
  }
  return effects;
}

function figEffect(fig: FigEffect): DesignEffect | null {
  const visible = fig.visible ?? true;
  switch (fig.type) {
    case "DROP_SHADOW":
    case "INNER_SHADOW": {
      const shadow = createEffect(fig.type === "DROP_SHADOW" ? "drop-shadow" : "inner-shadow");
      const color = figColor(fig.color);
      return {
        ...shadow,
        visible,
        ...color,
        x: fig.offset?.x ?? 0,
        y: fig.offset?.y ?? 0,
        blur: fig.radius ?? 0,
        spread: fig.spread ?? 0,
        ...(shadow.type === "drop-shadow" ? { showBehind: fig.showShadowBehindNode ?? false } : {}),
      };
    }
    case "FOREGROUND_BLUR": {
      const blur = createEffect("layer-blur");
      const progressive = fig.blurOpType === "PROGRESSIVE";
      return {
        ...blur,
        visible,
        radius: fig.radius ?? 0,
        progressive,
        ...(progressive
          ? {
              startRadius: fig.startRadius ?? 0,
              start: fig.startOffset ?? blur.start,
              end: fig.endOffset ?? blur.end,
            }
          : {}),
      };
    }
    case "BACKGROUND_BLUR":
      return { ...createEffect("background-blur"), visible, radius: fig.radius ?? 0 };
    default:
      return null;
  }
}

function figColor(color: FigColor | undefined): { color: string; opacity: number } {
  if (!color) return { color: "#000000", opacity: 0.25 };
  const hex = [color.r, color.g, color.b]
    .map((c) =>
      Math.round(Math.min(Math.max(c, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  return { color: `#${hex.toUpperCase()}`, opacity: color.a };
}
