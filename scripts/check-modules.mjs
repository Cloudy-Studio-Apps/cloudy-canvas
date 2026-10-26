// Checks the module rules (docs/modules.md) that ESLint can't see; part of `pnpm lint`
// (`pnpm check:modules` alone). Prints one line per violation and exits 1, or prints nothing.
//
//   files         a module folder lacks index.ts, <name>.module.ts or README.md
//   tier          a built-in module doesn't say its tier
//   deep          an import into another module's files instead of its index.ts or ui/index.ts
//   requires      a module imports a feature that isn't in its `requires` or `uses`
//   core-feature  a core module imports a feature
//   mcp           an old *.agent-tool*.ts file, or a .mcp.ts outside <name>.mcp.ts / mcp/
//   size          a <name>.module.ts over 120 lines (wiring only; split it)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, sep } from "node:path";

import { modulesDir, PRODUCTS, readModules } from "./module-info.mjs";

const MAX_MODULE_LINES = 120;
const problems = [];
const report = (file, line, rule, message) =>
  problems.push(`${file.split(sep).join("/")}:${line}  ${rule}: ${message}`);

/** Every .ts/.tsx file under `dir`. */
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

/** `[specifier, line]` for each import/export-from/dynamic import in a file. */
function specifiers(text) {
  const found = [];
  const pattern = /(?:\bfrom|\bimport)\s*\(?\s*"([^"]+)"/g;
  for (const match of text.matchAll(pattern)) {
    found.push([match[1], text.slice(0, match.index).split("\n").length]);
  }
  return found;
}

/** `{ product, module, rest }` when `spec` (imported from `file`) points into a module folder. */
function moduleTarget(file, spec) {
  let path;
  if (spec.startsWith(".")) path = normalize(join(dirname(file), spec));
  else {
    const alias = spec.match(/^@(design|board)\/modules\/(.+)$/);
    if (!alias) return null;
    path = join(modulesDir(alias[1]), alias[2]);
  }
  for (const product of PRODUCTS) {
    const rel = relative(modulesDir(product), path);
    if (rel.startsWith("..") || rel === "" || rel.startsWith(sep)) continue;
    const [module, ...rest] = rel.split(sep);
    if (module === "index" || module === "index.ts") return null;
    return { product, module, rest: rest.join("/") };
  }
  return null;
}

/** Where a file is: `{ product, module }` for files inside a module folder, else `null`. */
function ownerOf(file) {
  for (const product of PRODUCTS) {
    const rel = relative(modulesDir(product), file);
    if (!rel.startsWith("..") && rel.includes(sep)) return { product, module: rel.split(sep)[0] };
  }
  return null;
}

const PUBLIC_ENTRIES = new Set(["", "index", "ui", "ui/index"]);
const catalog = new Map(PRODUCTS.map((product) => [product, readModules(product)]));

// Module folders: files, tier, size.
for (const [product, modules] of catalog) {
  for (const module of modules.values()) {
    const dir = join(modulesDir(product), module.name);
    for (const file of ["index.ts", `${module.name}.module.ts`, "README.md"]) {
      if (!existsSync(join(dir, file))) report(dir, 1, "files", `missing ${file}`);
    }
    if (!module.file) continue;
    if (module.tier !== "core" && module.tier !== "feature") {
      report(module.file, 1, "tier", `say tier: "core" or "feature" in defineModule`);
    }
    const lines = readFileSync(module.file, "utf8").split("\n").length;
    if (lines > MAX_MODULE_LINES) {
      report(module.file, 1, "size", `${lines} lines; split it (docs/modules.md, Module anatomy)`);
    }
  }
}

// Imports and MCP files, over the whole frontend.
for (const file of sourceFiles("src")) {
  const posix = file.split(sep).join("/");
  if (/\.agent-tools?(\.types)?\.ts$/.test(posix)) {
    report(file, 1, "mcp", "MCP tools live in <name>.mcp.ts or mcp/<topic>.mcp.ts");
  }
  if (
    posix.endsWith(".mcp.ts") &&
    !/^src\/(canvas\/mcp|products\/[^/]+\/mcp)\//.test(posix) &&
    !/^src\/products\/[^/]+\/modules\/([^/]+)\/(\1\.mcp\.ts|mcp\/)/.test(posix)
  ) {
    report(file, 1, "mcp", "a module's MCP tools are <name>.mcp.ts or mcp/<topic>.mcp.ts");
  }

  const owner = ownerOf(file);
  const from = owner && catalog.get(owner.product).get(owner.module);
  const isModuleList = /^src\/products\/[^/]+\/ui\/modules\/[^/]+-modules\.ts$/.test(posix);
  for (const [spec, line] of specifiers(readFileSync(file, "utf8"))) {
    const target = moduleTarget(file, spec);
    if (!target) continue;
    if (owner && owner.product === target.product && owner.module === target.module) continue;
    const to = catalog.get(target.product).get(target.module);
    if (!to) continue;

    const listsModule = isModuleList && target.rest === `${target.module}.module`;
    if (!PUBLIC_ENTRIES.has(target.rest) && !listsModule) {
      const entry = target.rest.startsWith("ui/") ? "ui" : "";
      const shown = [target.module, entry].filter(Boolean).join("/");
      report(file, line, "deep", `import ${target.module} through "…/${shown}", not "${spec}"`);
    }
    if (!from || target.product !== owner.product) continue;
    if (from.tier === "core" && to.tier === "feature") {
      report(file, line, "core-feature", `core module ${from.name} imports feature ${to.name}`);
    } else if (to.tier !== "core" && !from.requires.includes(to.id) && !from.uses.includes(to.id)) {
      report(file, line, "requires", `${from.name} imports ${to.name}; add "${to.id}" to requires`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} module rule problem(s). See docs/modules.md.`);
  process.exit(1);
}
