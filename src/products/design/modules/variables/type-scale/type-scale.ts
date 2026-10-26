import { DEFAULT_SCALE_SETTINGS, numberScale } from "@canvas";

import type { TypeScaleSettings, TypeScaleStep } from "./type-scale.types";

/** A new type scale's settings, but where it goes and its font. */
export const DEFAULT_TYPE_SCALE: Omit<TypeScaleSettings, "collection" | "font"> = {
  ...DEFAULT_SCALE_SETTINGS,
  base: 16,
  ratio: 1.25,
  below: 2,
  above: 5,
  group: "type",
  headingWeight: "700",
  bodyWeight: "400",
  lineHeight: { heading: 1.2, body: 1.5 },
};

/** A type scale's steps: the number scale's sizes, headings above `md`, body at and below it. */
export function typeScaleSteps(settings: TypeScaleSettings): TypeScaleStep[] {
  return numberScale(settings.base, settings).map((step) => {
    const heading = step.value > settings.base;
    return {
      name: step.name,
      size: step.value,
      heading,
      weight: heading ? settings.headingWeight : settings.bodyWeight,
      lineHeight: heading ? settings.lineHeight.heading : settings.lineHeight.body,
    };
  });
}

/** A group path as a style group: "type" → "Type". */
export function styleGroupOf(group: string): string {
  return group
    .split("/")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join("/");
}
