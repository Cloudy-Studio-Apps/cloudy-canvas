import {
  formatValue,
  readValue,
  resolveRichTemplate,
  templateReadsUnreadable,
  type DataScope,
} from "../../../data";

/**
 * A section's name with its tokens (`{product.name}`) read in `scope` and written in `locale`. A
 * token nothing in scope answers is kept as written, so names with braces and no data stay as
 * they are; a name reading a source this device can't read is left whole.
 */
export function copyName(name: string, scope: DataScope, locale: string): string {
  if (!name.includes("{")) return name;
  const template = { text: name, runs: [] };
  if (templateReadsUnreadable(scope, template)) return name;
  return resolveRichTemplate(template, (expr) => {
    const found = readValue(scope, expr);
    return found ? formatValue(found.value, found.field, undefined, locale) : `{${expr}}`;
  }).text;
}
