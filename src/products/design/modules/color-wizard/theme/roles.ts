import { colorOklch } from "../color";

const ROLE_ORDER = ["primary", "secondary", "accent", "tertiary", "highlight", "extra"];

/**
 * A role name for each color: the ones it has kept (unless taken twice), the grayest as
 * `neutral` when it's gray enough and there are at least three, the rest by chroma: primary,
 * secondary, accent, …
 */
export function defaultRoleNames(colors: readonly { hex: string; name?: string }[]): string[] {
  const seen = new Set<string>();
  const names = colors.map((c) => {
    if (!c.name || seen.has(c.name)) return undefined;
    seen.add(c.name);
    return c.name;
  });
  const byChroma = colors
    .map((c, i) => ({ i, chroma: colorOklch(c.hex).C }))
    .sort((a, b) => b.chroma - a.chroma);
  const grayest = byChroma.at(-1);
  if (
    grayest &&
    !names[grayest.i] &&
    grayest.chroma < 0.05 &&
    colors.length > 2 &&
    !seen.has("neutral")
  ) {
    names[grayest.i] = "neutral";
    seen.add("neutral");
  }
  const free = ROLE_ORDER.filter((n) => !seen.has(n));
  for (const { i } of byChroma) names[i] ??= free.shift() ?? `color-${i + 1}`;
  return names as string[];
}

/** A typed role name as a variable group: lower case, dashes, slashes for subgroups. */
export function cleanRoleName(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9/_-]/g, "");
}
