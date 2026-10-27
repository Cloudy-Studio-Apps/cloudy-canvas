/** A message tree as dot path → string (`{ panel: { add: "Add" } }` → `panel.add`). */
export function flattenMessages(
  tree: Readonly<Record<string, unknown>>,
  prefix = "",
  into = new Map<string, string>(),
): Map<string, string> {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") into.set(path, value);
    else if (value && typeof value === "object") {
      flattenMessages(value as Readonly<Record<string, unknown>>, path, into);
    }
  }
  return into;
}
