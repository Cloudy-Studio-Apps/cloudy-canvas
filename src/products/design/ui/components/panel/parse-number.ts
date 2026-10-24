import { evaluateNumber } from "@shared/ui/kit";

/** A typed number, arithmetic included ("120+24"); `null` when it isn't one. */
export function parseNumber(text: string): number | null {
  return evaluateNumber(text);
}
