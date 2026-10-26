import { CHECKED_CVD, colorDistance, simulateCvd } from "../color";
import { themeColor } from "./build-theme";
import type { CvdWarning, WizardTheme } from "./theme.types";

/** Roles people must tell apart (a success from an error, …). */
const PAIRS: readonly (readonly [string, string])[] = [
  ["success", "error"],
  ["warning", "error"],
  ["success", "warning"],
  ["primary", "error"],
  ["primary", "accent"],
  ["info", "success"],
];

/** Below this OKLab distance two colors pass for one. */
const ALIKE = 0.08;

/** The pairs that look alike in the theme's first mode: to everyone, or with some deficiencies. */
export function cvdWarnings(theme: WizardTheme): CvdWarning[] {
  const mode = theme.modes[0];
  if (!mode) return [];
  return PAIRS.flatMap(([a, b]): CvdWarning[] => {
    const aHex = themeColor(theme, a, mode);
    const bHex = themeColor(theme, b, mode);
    if (!aHex || !bHex) return [];
    if (colorDistance(aHex, bHex) < ALIKE) return [{ a, b, aHex, bHex, everyone: true, kinds: [] }];
    const kinds = CHECKED_CVD.filter(
      (k) => colorDistance(simulateCvd(aHex, k), simulateCvd(bHex, k)) < ALIKE,
    );
    return kinds.length ? [{ a, b, aHex, bHex, everyone: false, kinds }] : [];
  });
}
