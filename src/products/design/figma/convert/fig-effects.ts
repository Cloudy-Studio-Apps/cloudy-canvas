import type { FigColor, FigEffect, FigImportContext, FigNode } from "@canvas/figma";

import { createEffect, type DesignEffect, type NoiseEffect } from "../../modules";

/** Figma's noise types by ours. */
const NOISE_TYPES: Record<string, NoiseEffect["noiseType"]> = {
  MONOTONE: "mono",
  DUOTONE: "duo",
  MULTITONE: "multi",
};

/**
 * A Figma node's effects, bottom to top as ours are: drop and inner shadows (offset, blur,
 * spread, color, "show behind"), layer blurs (progressive ones too), background blurs, noise and
 * texture. Other effects, and effects' blend modes, are counted in the import's warnings.
 */
export function figEffects(node: FigNode, ctx: FigImportContext): DesignEffect[] {
  const effects: DesignEffect[] = [];
  for (const fig of node.effects ?? []) {
    const effect = figEffect(fig);
    if (effect && fig.blendMode && fig.blendMode !== "NORMAL") {
      ctx.warnings.add("effects' blend modes were left out");
    }
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
    case "NOISE": {
      const noise = createEffect("noise");
      return {
        ...noise,
        visible,
        noiseType: NOISE_TYPES[fig.noiseType ?? ""] ?? noise.noiseType,
        ...figColor(fig.color),
        secondColor: fig.secondaryColor ? figColor(fig.secondaryColor).color : noise.secondColor,
        size: grainSize(fig) ?? noise.size,
        density: fig.density ?? noise.density,
      };
    }
    case "TEXTURE": {
      const texture = createEffect("texture");
      return {
        ...texture,
        visible,
        size: grainSize(fig) ?? texture.size,
        radius: fig.radius ?? texture.radius,
        clipToShape: fig.clipToShape ?? texture.clipToShape,
      };
    }
    default:
      return null;
  }
}

/**
 * The grain size of noise and texture. The file keeps it as a vector, and its `y` is the size
 * (its `x` isn't used here).
 */
function grainSize(fig: FigEffect): number | undefined {
  const size = fig.noiseSize?.y;
  return size !== undefined && size > 0 ? size : undefined;
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
