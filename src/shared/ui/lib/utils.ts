import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** The density sizes (`h-control`, `px-control-x`, `h-row`, …), so later classes replace them. */
const DENSITY_SPACING = ["control", "control-sm", "control-lg", "control-x", "row"];

const twMerge = extendTailwindMerge({
  extend: { theme: { spacing: DENSITY_SPACING } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
