import { formatValue } from "./format-value";
import { readValue } from "./read-value";
import { resolveRichTemplate } from "./resolve-template";
import { templateReadsUnreadable } from "./unreadable";
import type { DataTemplate } from "./binding.types";
import type { ResolvedTemplate } from "./resolve-template.types";
import type { DataScope } from "./scope.types";

/**
 * A text's template filled from `scope` in `locale` (each token written with `formatValue`), or
 * `null` when a token reads a source whose data can't be read here: the text is left as it is.
 */
export function resolveDataText(
  template: DataTemplate,
  scope: DataScope,
  locale: string,
): ResolvedTemplate | null {
  if (templateReadsUnreadable(scope, template)) return null;
  return resolveRichTemplate(template, (expr) => {
    const found = readValue(scope, expr);
    return found ? formatValue(found.value, found.field, undefined, locale) : null;
  });
}
