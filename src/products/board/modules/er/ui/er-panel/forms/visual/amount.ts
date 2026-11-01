import { t } from "../../../../er.i18n";

/** The usual amounts, as `[min, max]`. */
export const AMOUNTS = [
  ["0", "1"],
  ["1", "1"],
  ["0", "n"],
  ["1", "n"],
] as const;

const WORDS: Record<string, string> = {
  "0:1": t("form.amount.zeroOrOne"),
  "1:1": t("form.amount.exactlyOne"),
  "0:n": t("form.amount.zeroOrMore"),
  "1:n": t("form.amount.oneOrMore"),
};

/** A `(min,max)` in words. */
export function amountWord(min: string, max: string): string {
  const preset = WORDS[`${min}:${max}`];
  if (preset) return preset;
  if (!min && !max) return t("form.amount.unset");
  if (min === max) return t("form.amount.exactly", { value: min });
  return t("form.amount.range", { min, max: max === "n" ? t("form.amount.many") : max });
}
