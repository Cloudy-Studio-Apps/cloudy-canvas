import type { TextRunStyle } from "@design";

/**
 * What the Typography section reads and writes: the selected texts, or, while a text is edited,
 * its selected characters.
 */
export interface TypographyTarget {
  /** Whether it's the selected characters of the text being edited. */
  range: boolean;
  /** A field's value, `null` when it's mixed. */
  read<K extends keyof TextRunStyle>(field: K): Required<TextRunStyle>[K] | null;
  /** Sets fields (on the range, or on all of each text, clearing its ranges' own values). */
  set(patch: Partial<TextRunStyle>): void;
}
