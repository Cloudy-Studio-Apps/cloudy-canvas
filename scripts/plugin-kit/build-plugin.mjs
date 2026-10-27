// `pnpm plugin:build <folder>`: bundles a plugin's `src/` (TypeScript, JSX, any structure) into
// the one `main.js` the app loads (docs/plugins.md, scripts/plugin-kit/README.md). Its imports of
// the app become reads of `api` (api-imports.mjs); everything else is bundled. Prints the size,
// or one line per problem and exits 1.
import { existsSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { rolldown } from "rolldown";

import { apiModuleCode, resolveApiImport } from "./api-imports.mjs";
import { collectImports } from "./imported-names.mjs";

const VIRTUAL = "\0cloudy-api:";
const IMAGES = [".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"];

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) fail(["Usage: pnpm plugin:build <plugin folder>"]);
const folder = resolve(arg);
const entry = ["main.ts", "main.tsx"].map((name) => join(folder, "src", name)).find(existsSync);
if (!entry) fail([`${arg} has no src/main.ts (or main.tsx) to build.`]);

const { imports, problems } = collectImports(folder);
if (problems.length > 0) {
  fail([...problems, `\n${problems.length} import problem(s). See scripts/plugin-kit/README.md.`]);
}

let output;
try {
  const bundle = await rolldown({
    input: entry,
    platform: "browser",
    transform: { jsx: { runtime: "automatic" } },
    // Images import as their URL, like Vite: here a data URL inside main.js.
    moduleTypes: Object.fromEntries(IMAGES.map((ext) => [ext, "dataurl"])),
    plugins: [
      {
        name: "cloudy-api",
        resolveId(spec) {
          return resolveApiImport(spec) ? VIRTUAL + spec : null;
        },
        load(id) {
          if (!id.startsWith(VIRTUAL)) return null;
          const spec = id.slice(VIRTUAL.length);
          return apiModuleCode(resolveApiImport(spec), [...(imports.get(spec) ?? [])]);
        },
      },
    ],
  });
  ({ output } = await bundle.generate({ format: "iife", name: "__plugin", exports: "named" }));
  await bundle.close();
} catch (error) {
  // A syntax error, a missing file, …: rolldown's message names the file and line.
  fail([error instanceof Error ? error.message : String(error)]);
}

const code = `// Built by scripts/plugin-kit from src/. Don't edit: run \`pnpm plugin:build <folder>\`.
export default function activate(__api) {
  const __bindings = [];
  const __late = (id, bind) => __bindings.push({ id, bind });
${output[0].code}
  // Names from host.require (a module's UI and points outside the barrels) arrive when the
  // plugin's first module registers.
  const bind = (host) => {
    for (const { id, bind } of __bindings.splice(0)) bind(host.require(id));
  };
  const wrap = (module) => ({
    ...module,
    register(host) {
      bind(host);
      return module.register(host);
    },
  });
  const result = __plugin.default;
  if (result === undefined) throw new Error("src/main has no default export (the plugin's modules).");
  if (Array.isArray(result)) return result.map(wrap);
  if (typeof result.register === "function") return wrap(result);
  return Object.fromEntries(Object.entries(result).map(([product, list]) => [product, list.map(wrap)]));
}
`;
const out = join(folder, "main.js");
writeFileSync(out, code);
console.log(`${relative(process.cwd(), out)}  ${(code.length / 1024).toFixed(1)} kB`);
