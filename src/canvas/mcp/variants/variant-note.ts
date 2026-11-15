import type { VariantPick } from "./variant-choices.types";

/** What an agent is told, with its next reply, about a pick the user made after its wait. */
export function variantNote(pick: VariantPick): string {
  const note = "note" in pick && pick.note ? ` Their note: "${pick.note}"` : "";
  switch (pick.choice) {
    case "one":
      return `The user chose variant ${pick.label} (id ${pick.kept}); the other variants (${pick.removed.join(", ")}) were removed.${note}`;
    case "all":
      return `The user kept all the variants.${note}`;
    case "dismissed":
      return "The user closed the variant chooser without choosing.";
  }
}

/** The default labels of `count` variants: A, B, C… */
export function variantLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}
