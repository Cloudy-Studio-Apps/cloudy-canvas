// Checks that a feature uses only what a plugin can reach (CLAUDE.md rule 18, the module
// conventions spec §14.5); part of `pnpm lint` (`pnpm check:public-api` alone). A plugin gets the
// barrels and the curated groups in `src/app/plugins/api/`, so every value a feature module imports
// from outside its folder must be exported by the barrel that covers the file it comes from:
//
//   src/canvas/**          src/canvas/index.ts
//   src/canvas-ui/**       src/canvas-ui/index.ts
//   src/shared/core/**     src/shared/core/index.ts
//   src/shared/ui/kit/**   src/shared/ui/kit/index.ts
//   another module         its index.ts (engine files) or ui/index.ts (ui/ files)
//   src/products/<p>/ui/** src/products/<p>/ui/index.ts
//   src/products/<p>/**    src/products/<p>/index.ts
//   other src/**           src/app/plugins/api/plugin-ui.ts or plugin-platform.ts
//
// npm packages aren't checked: the shared ones are in `api.libs`, the rest a plugin bundles.
// Type imports aren't checked either: plugins are plain JavaScript. Prints one line per problem
// and exits 1, or prints nothing.
import { join, relative, sep } from "node:path";
import ts from "typescript";

import { modulesDir, PRODUCTS, readModules } from "./module-info.mjs";

const root = process.cwd();
const posix = (file) => relative(root, file).split(sep).join("/");

const config = ts.getParsedCommandLineOfConfigFile(
  "tsconfig.json",
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      process.exit(1);
    },
  },
);
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();

const exportCache = new Map();
/** The names `file` exports (values and types), or an empty set when it isn't in the program. */
function exportsOf(file) {
  if (!exportCache.has(file)) {
    const source = program.getSourceFile(join(root, file));
    const symbol = source && checker.getSymbolAtLocation(source);
    exportCache.set(
      file,
      new Set(symbol ? checker.getExportsOfModule(symbol).map((s) => s.name) : []),
    );
  }
  return exportCache.get(file);
}

const BARRELS = [
  ["src/canvas/", "src/canvas/index.ts"],
  ["src/canvas-ui/", "src/canvas-ui/index.ts"],
  ["src/shared/core/", "src/shared/core/index.ts"],
  ["src/shared/ui/kit/", "src/shared/ui/kit/index.ts"],
];
const CURATED = ["src/app/plugins/api/plugin-ui.ts", "src/app/plugins/api/plugin-platform.ts"];

/** The barrel files whose exports a plugin sees for an import of `target`. */
function barrelsFor(target) {
  for (const [prefix, barrel] of BARRELS) if (target.startsWith(prefix)) return [barrel];
  const inModule = target.match(/^src\/products\/([^/]+)\/modules\/([^/]+)\/(.*)$/);
  if (inModule) {
    const [, product, module, rest] = inModule;
    const entry = rest.startsWith("ui/") ? "ui/index.ts" : "index.ts";
    return [`src/products/${product}/modules/${module}/${entry}`];
  }
  const inProduct = target.match(/^src\/products\/([^/]+)\/(ui\/)?/);
  if (inProduct) return [`src/products/${inProduct[1]}/${inProduct[2] ? "ui/" : ""}index.ts`];
  return CURATED;
}

/** The value names an import declaration brings in (`default`, `*` or named). */
function valueNames(declaration) {
  const clause = declaration.importClause;
  if (!clause || clause.isTypeOnly) return [];
  const names = [];
  if (clause.name) names.push("default");
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings)) names.push("*");
  else if (bindings) {
    for (const element of bindings.elements) {
      if (element.isTypeOnly) continue;
      let symbol = checker.getSymbolAtLocation(element.name);
      if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
      if (symbol && !(symbol.flags & ts.SymbolFlags.Value)) continue;
      names.push((element.propertyName ?? element.name).text);
    }
  }
  return names;
}

const features = PRODUCTS.flatMap((product) =>
  [...readModules(product).values()]
    .filter((module) => module.tier === "feature")
    .map((module) => `${modulesDir(product).split(sep).join("/")}/${module.name}/`),
);

const problems = [];
for (const source of program.getSourceFiles()) {
  const file = posix(source.fileName);
  const folder = features.find((prefix) => file.startsWith(prefix));
  if (!folder) continue;
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const spec = statement.moduleSpecifier.text;
    const resolved = ts.resolveModuleName(
      spec,
      source.fileName,
      config.options,
      ts.sys,
    ).resolvedModule;
    if (!resolved || resolved.isExternalLibraryImport) continue;
    const target = posix(resolved.resolvedFileName);
    if (target.startsWith(folder) || !target.startsWith("src/")) continue;
    const barrels = barrelsFor(target);
    for (const name of valueNames(statement)) {
      if (name !== "*" && barrels.some((barrel) => exportsOf(barrel).has(name))) continue;
      const line = source.getLineAndCharacterOfPosition(statement.getStart()).line + 1;
      problems.push(
        `${file}:${line}  public: ${name} from "${spec}" isn't in ${barrels.join(" or ")}; export it there (rule 18)`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} public API problem(s). See docs/modules.md, Import rules.`);
  process.exit(1);
}
