import { clamp } from "@canvas";

import { colorOklch, hueTurn, oklchColor } from "../color";
import type { WizardColor, WizardOptions, WizardRole } from "./theme.types";

/** The status colors: their usual hue and lightness. */
const STATUS = [
  { name: "success", h: 150, L: 0.6 },
  { name: "warning", h: 75, L: 0.74 },
  { name: "error", h: 27, L: 0.58 },
  { name: "info", h: 245, L: 0.6 },
] as const;

const primaryOf = (colors: readonly WizardColor[]) =>
  colors.find((c) => c.name === "primary") ?? colors[0];

/** A gray tinted with the primary's hue. */
export function tintedNeutral(colors: readonly WizardColor[]): string {
  const primary = primaryOf(colors);
  return oklchColor(0.6, 0.018, primary ? colorOklch(primary.hex).h : 250);
}

/** The status colors no role is already, their hue nudged toward the primary so they belong. */
export function statusColors(colors: readonly WizardColor[]): WizardColor[] {
  const primary = primaryOf(colors);
  const p = primary ? colorOklch(primary.hex) : { C: 0.14, h: 250 };
  return STATUS.filter((s) => !colors.some((c) => c.name === s.name)).map((s) => ({
    name: s.name,
    hex: oklchColor(s.L, clamp(p.C, 0.12, 0.18), s.h + clamp(hueTurn(s.h, p.h), -40, 40) * 0.15),
    added: true,
  }));
}

/** Every color that becomes a variable group: the included roles, then what the options add. */
export function wizardColors(roles: readonly WizardRole[], options: WizardOptions): WizardColor[] {
  const colors: WizardColor[] = roles
    .filter((r) => r.include && r.name.trim())
    .map((r) => ({ name: r.name.trim(), hex: r.hex, added: false, fills: r.fills }));
  if (options.neutral && !colors.some((c) => c.name === "neutral")) {
    colors.push({ name: "neutral", hex: tintedNeutral(colors), added: true });
  }
  if (options.status) colors.push(...statusColors(colors));
  return colors;
}
