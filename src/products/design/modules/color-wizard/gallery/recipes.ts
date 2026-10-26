import { between, oklchColor, pickOne, type Random } from "../color";
import type { ColorRanges, RangeRecipe } from "./gallery.types";

const SIZE = 5;

/** Five colors in the recipe's ranges. */
export function rangePalette(recipe: RangeRecipe): (random: Random) => string[] {
  return (random) => {
    const hueRange = recipe.hues ? pickOne(random, recipe.hues) : ([0, 360] as const);
    const center = between(random, ...hueRange);
    const colors = Array.from({ length: SIZE }, () => ({
      L: between(random, ...recipe.l),
      C: between(random, ...recipe.c),
      h:
        recipe.spread !== undefined
          ? center + between(random, -recipe.spread / 2, recipe.spread / 2)
          : recipe.hues
            ? between(random, ...pickOne(random, recipe.hues))
            : between(random, 0, 360),
    }));
    if (recipe.sorted !== false) colors.sort((a, b) => b.L - a.L);
    return colors.map((c) => oklchColor(c.L, c.C, c.h));
  };
}

/** One color per range set, in order (a theme's fixed roles: sky, sun, sea, …). */
export function mixPalette(ranges: ColorRanges): (random: Random) => string[] {
  return (random) =>
    ranges.map(([l, c, h]) =>
      oklchColor(between(random, ...l), between(random, ...c), between(random, ...h)),
    );
}

/** Five steps from a deep color to a light one, the hue turning on the way. */
export function gradientPalette(random: Random): string[] {
  const a = {
    L: between(random, 0.45, 0.6),
    C: between(random, 0.1, 0.2),
    h: between(random, 0, 360),
  };
  const b = { L: between(random, 0.8, 0.92), C: between(random, 0.06, 0.14) };
  const turn = between(random, 40, 140);
  return Array.from({ length: SIZE }, (_, i) => {
    const t = i / (SIZE - 1);
    return oklchColor(a.L + (b.L - a.L) * t, a.C + (b.C - a.C) * t, a.h + turn * t);
  });
}

/** Five hues evenly around the wheel at one lightness and chroma. */
export function rainbowPalette(random: Random): string[] {
  const start = between(random, 0, 360);
  const L = between(random, 0.62, 0.78);
  const C = between(random, 0.13, 0.2);
  return Array.from({ length: SIZE }, (_, i) => oklchColor(L, C, start + i * 72));
}
