import { formatPath, joinKey, parsePath } from "../table";
import type { PathStep } from "../table";

/** The key a scope keeps a field under: any index step is `[]`, `products[3].price` → `products[].price`. */
export function fieldKey(steps: PathStep[]): string {
  let out = "";
  for (const step of steps) out = "index" in step ? `${out}[]` : joinKey(out, step.key);
  return out;
}

/** An expression written with a sample row, `products[].price` → `products[0].price`. */
export function sampleExpression(key: string): string {
  let out = "";
  let quoted = false;
  for (let i = 0; i < key.length; i++) {
    const c = key[i] as string;
    if (quoted) {
      out += c;
      if (c === "\\") out += key[++i] ?? "";
      else if (c === '"') quoted = false;
    } else if (c === '"') {
      quoted = true;
      out += c;
    } else if (c === "[" && key[i + 1] === "]") {
      out += "[0]";
      i++;
    } else out += c;
  }
  return formatPath(parsePath(out));
}
