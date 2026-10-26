import type { StyleguideCategory } from "../styleguide.types";
import type { StyleguideSettings } from "../sheet";

/** The categories in the view's order: the user's (`settings.order`), then the rest by `order`. */
export function orderedCategories(
  categories: readonly StyleguideCategory[],
  settings: StyleguideSettings,
): StyleguideCategory[] {
  const rank = (category: StyleguideCategory) => {
    const at = settings.order.indexOf(category.id);
    return at < 0 ? Number.MAX_SAFE_INTEGER : at;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.order - b.order);
}
