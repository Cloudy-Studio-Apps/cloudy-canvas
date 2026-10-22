import type { FontRequest, FontVariant, FontWeight } from "./font.types";

export const FONT_WEIGHTS: readonly FontWeight[] = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

/** How weights are named in pickers. */
export const FONT_WEIGHT_NAMES: Readonly<Record<FontWeight, string>> = {
  "100": "Thin",
  "200": "Extra Light",
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "Semi Bold",
  "700": "Bold",
  "800": "Extra Bold",
  "900": "Black",
};

/** A face's name, e.g. "Semi Bold Italic". */
export function variantName({ weight, style }: FontVariant): string {
  const name = FONT_WEIGHT_NAMES[weight];
  if (style === "normal") return name;
  return weight === "400" ? "Italic" : `${name} Italic`;
}

/** The nearest CSS weight to any number (fonts report 350, 450, …). */
export function nearestWeight(weight: number): FontWeight {
  const rounded = Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
  return String(rounded) as FontWeight;
}

/** Faces sorted by style (upright first), then weight; duplicates dropped. */
export function sortVariants(variants: readonly FontVariant[]): FontVariant[] {
  const seen = new Set<string>();
  return [...variants]
    .filter((variant) => {
      const key = `${variant.weight}${variant.style}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) =>
      a.style === b.style ? Number(a.weight) - Number(b.weight) : a.style === "normal" ? -1 : 1,
    );
}

/** The key of a face (`family|weight|style`), e.g. for caches. */
export function fontKey({ family, weight, style }: FontRequest): string {
  return `${family}|${weight}|${style}`;
}

/** The face of `variants` closest to `wanted`: same style first, then the nearest weight. */
export function closestVariant(
  variants: readonly FontVariant[],
  wanted: FontVariant,
): FontVariant | undefined {
  const distance = (variant: FontVariant) =>
    (variant.style === wanted.style ? 0 : 1000) +
    Math.abs(Number(variant.weight) - Number(wanted.weight));
  return [...variants].sort((a, b) => distance(a) - distance(b))[0];
}
