import type { BookLayout } from "../../model/book-layout.types";
import { isBackCover } from "../../model/is-back-cover";
import { t } from "../../catalog.i18n";

/**
 * A book spread's heading in the page list: "Front cover", "Back cover", or the printed page
 * numbers ("Pages 2–3", "Page 4" for a side alone).
 */
export function spreadLabel(layout: BookLayout, spread: readonly number[]): string {
  const [first = 0, second] = spread;
  const alone = second === undefined;
  const isFront = alone && first === 0 && layout.offset === 1;
  if (isFront) return t("tab.spread.front");
  if (isBackCover(layout, spread)) return t("tab.spread.back");
  return alone
    ? t("tab.spread.page", { n: first + 1 })
    : t("tab.spread.pages", { from: first + 1, to: second + 1 });
}
