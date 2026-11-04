import { pathRoot, readPath, setPathsPatch } from "@canvas";

/**
 * A template field as a copy takes it, `null` when the copy keeps the whole field: leaves under it
 * that the copy keeps (`fills.0.color` in `fills`) hold the copy's value, the rest the template's.
 */
export function mirroredField(
  field: string,
  value: unknown,
  copy: object,
  kept: readonly string[],
): { value: unknown } | null {
  const under = kept.filter((path) => pathRoot(path) === field);
  if (under.includes(field)) return null;
  let holder: Record<string, unknown> = { [field]: value };
  for (const path of under) {
    const own = readPath(copy, path);
    if (own === undefined) continue;
    // A leaf the template's value has no place for is the template's to drop.
    const next = setPathsPatch(holder, { [path]: own });
    if (next) holder = next;
  }
  return { value: holder[field] };
}
