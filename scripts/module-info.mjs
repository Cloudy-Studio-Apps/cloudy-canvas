// Reads the products' built-in modules from the source (no compile): each module's folder, id,
// tier, `requires` and `after`, and the order the app loads them in. Used by check-modules.mjs and
// module-order.mjs.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const PRODUCTS = ["design", "board"];

/** `src/products/<product>/modules`. */
export const modulesDir = (product) => join("src", "products", product, "modules");

/** The string ids in `key: ["a", "b"]`, or `[]`. */
function idList(text, key) {
  const match = text.match(new RegExp(`\\b${key}:\\s*\\[([^\\]]*)\\]`));
  return match ? [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
}

/**
 * A product's module folders, keyed by folder name: `{ name, id, tier, requires, uses, after,
 * file, variable }` (`file`/`id` missing when the folder has no `<name>.module.ts`).
 */
export function readModules(product) {
  const dir = modulesDir(product);
  const modules = new Map();
  for (const name of readdirSync(dir)) {
    if (!statSync(join(dir, name)).isDirectory()) continue;
    const file = join(dir, name, `${name}.module.ts`);
    const info = { name, requires: [], uses: [], after: [] };
    if (existsSync(file)) {
      const text = readFileSync(file, "utf8");
      info.file = file;
      info.id = text.match(/\bid:\s*"([^"]+)"/)?.[1];
      info.tier = text.match(/\btier:\s*"([^"]+)"/)?.[1];
      info.requires = idList(text, "requires");
      info.uses = idList(text, "uses");
      info.after = idList(text, "after");
      info.variable = text.match(/export const (\w+)\s*=\s*defineModule/)?.[1];
    }
    modules.set(name, info);
  }
  return modules;
}

/** The module ids in the order `ui/modules/<product>-modules.ts` lists them. */
export function listedIds(product, modules) {
  const text = readFileSync(
    join("src", "products", product, "ui", "modules", `${product}-modules.ts`),
    "utf8",
  );
  const list = text.match(/let modules: AppModule\[\] = \[([^\]]*)\]/)?.[1] ?? "";
  const byVariable = new Map([...modules.values()].map((m) => [m.variable, m.id]));
  return [...list.matchAll(/\b(\w+Module)\b/g)].map((m) => byVariable.get(m[1]) ?? `?${m[1]}`);
}

/** The load order, as `sortModules` (`src/shared/core/modules/sort-modules.ts`) computes it. */
export function loadOrder(product) {
  const modules = readModules(product);
  const byId = new Map([...modules.values()].filter((m) => m.id).map((m) => [m.id, m]));
  const sorted = [];
  const done = new Set();
  const visit = (id) => {
    const module = byId.get(id);
    if (!module || done.has(id)) return;
    done.add(id);
    for (const dependency of [...module.requires, ...module.after]) visit(dependency);
    sorted.push(id);
  };
  for (const id of listedIds(product, modules)) visit(id);
  return sorted;
}
