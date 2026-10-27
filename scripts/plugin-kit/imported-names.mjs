// The first pass of a plugin build: every value name the plugin's files import from the app and
// the shared libraries, by import, and the imports it can't use. Type-only imports are skipped
// (`import type`, `type X`), so types must be imported that way (ESLint's
// consistent-type-imports already says so).
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";

import { nameProblem, resolveApiImport } from "./api-imports.mjs";

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [path] : [];
  });
}

/** The value names of an import or re-export, or `"*"` for a namespace. */
function valueNames(statement) {
  if (ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) return [];
    const names = clause.name ? ["default"] : [];
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) return [...names, "*"];
    for (const element of bindings?.elements ?? []) {
      if (!element.isTypeOnly) names.push((element.propertyName ?? element.name).text);
    }
    return names;
  }
  if (statement.isTypeOnly) return [];
  const clause = statement.exportClause;
  if (!clause || ts.isNamespaceExport(clause)) return ["*"];
  return clause.elements
    .filter((element) => !element.isTypeOnly)
    .map((element) => (element.propertyName ?? element.name).text);
}

/**
 * Reads the plugin's `src/`: `imports` maps each app or library specifier to the value names
 * imported from it; `problems` lists, as `file:line  message`, the imports a plugin can't make.
 */
export function collectImports(pluginDir) {
  const imports = new Map();
  const problems = [];
  for (const file of sourceFiles(join(pluginDir, "src"))) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest);
    for (const statement of source.statements) {
      const isImport = ts.isImportDeclaration(statement);
      if (!isImport && !(ts.isExportDeclaration(statement) && statement.moduleSpecifier)) continue;
      const spec = statement.moduleSpecifier.text;
      const where = () => {
        const line = source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1;
        return `${relative(pluginDir, file).split(sep).join("/")}:${line}`;
      };
      if (spec.startsWith(".")) {
        const target = resolve(dirname(file), spec);
        if (relative(pluginDir, target).startsWith("..")) {
          problems.push(
            `${where()}  "${spec}" is outside the plugin's folder: import the app by its aliases`,
          );
        }
        continue;
      }
      const target = resolveApiImport(spec);
      if (!target) continue;
      if (target.kind === "error") {
        problems.push(`${where()}  "${spec}" is ${target.message}`);
        continue;
      }
      const names = valueNames(statement);
      if (names.includes("*")) {
        problems.push(`${where()}  "${spec}": import the names you use, not the whole group (*)`);
        continue;
      }
      for (const name of names) {
        const problem = nameProblem(target, name);
        if (problem) problems.push(`${where()}  ${problem}`);
      }
      const known = imports.get(spec) ?? new Set();
      for (const name of names) known.add(name);
      imports.set(spec, known);
    }
  }
  return { imports, problems };
}
