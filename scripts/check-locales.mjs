// Checks the translations (src/shared/core/i18n/README.md) that TypeScript can't see; part of
// `pnpm lint` (`pnpm check:locales` alone). Prints one line per problem and exits 1, or prints
// nothing. For every `locales/` folder under src/ and examples/plugins/*/src/:
//
//   files         en.json or es.json is missing, or no <name>.i18n.ts sits next to the folder
//   shape         a value that's neither a string nor a group, or a key that's a string in one
//                 file and a group in the other
//   missing       a key in en.json that es.json lacks
//   extra         a key in es.json that en.json lacks
//   placeholders  the {name}s of a key differ between English and Spanish
//   plural        a <key>_<category> without its <key>_other
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "..");
const SOURCE = "en";
const TRANSLATIONS = ["es"];
const PLURAL = /^(.+)_(zero|one|two|few|many|other)$/;
const PLACEHOLDER = /\{(\w+)\}/g;

const problems = [];
const report = (file, line, rule, message) =>
  problems.push(`${relative(ROOT, file).split(sep).join("/")}:${line}  ${rule}: ${message}`);

/** Every `locales/` folder under `dir`. */
function localeFolders(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) return [];
    return name === "locales" ? [path] : localeFolders(path);
  });
}

/** The line a key's last segment is first written on, or 1. */
function lineOf(text, key) {
  const last = key.split(".").at(-1);
  const index = text.indexOf(`"${last}"`);
  return index < 0 ? 1 : text.slice(0, index).split("\n").length;
}

/** `{ text, leaves: Map<path, string>, groups: Set<path> }`, reporting non-string values. */
function readLocale(file) {
  const text = readFileSync(file, "utf8");
  const leaves = new Map();
  const groups = new Set();
  let tree;
  try {
    tree = JSON.parse(text);
  } catch (error) {
    report(file, 1, "shape", `not valid JSON (${error.message})`);
    return { text, leaves, groups };
  }
  const walk = (node, prefix) => {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") leaves.set(path, value);
      else if (value && typeof value === "object" && !Array.isArray(value)) {
        groups.add(path);
        walk(value, path);
      } else report(file, lineOf(text, path), "shape", `"${path}" is neither a string nor a group`);
    }
  };
  walk(tree, "");
  return { text, leaves, groups };
}

const placeholders = (value) =>
  [...value.matchAll(PLACEHOLDER)]
    .map((match) => match[1])
    .sort()
    .join(", ");

// The app, and the example plugins written in TypeScript (their src/, built by the plugin kit).
const PLUGINS = join(ROOT, "examples", "plugins");
const roots = [
  join(ROOT, "src"),
  ...readdirSync(PLUGINS)
    .map((name) => join(PLUGINS, name, "src"))
    .filter(existsSync),
];
for (const folder of roots.flatMap(localeFolders)) {
  const parent = dirname(folder);
  if (!readdirSync(parent).some((name) => name.endsWith(".i18n.ts"))) {
    report(folder, 1, "files", "no <name>.i18n.ts next to this locales/ folder");
  }
  const sourceFile = join(folder, `${SOURCE}.json`);
  if (!existsSync(sourceFile)) {
    report(folder, 1, "files", `${SOURCE}.json is missing`);
    continue;
  }
  const source = readLocale(sourceFile);

  for (const [key] of source.leaves) {
    const plural = key.match(PLURAL);
    if (plural && !source.leaves.has(`${plural[1]}_other`)) {
      report(
        sourceFile,
        lineOf(source.text, key),
        "plural",
        `"${key}" has no "${plural[1]}_other"`,
      );
    }
  }

  for (const language of TRANSLATIONS) {
    const file = join(folder, `${language}.json`);
    if (!existsSync(file)) {
      report(folder, 1, "files", `${language}.json is missing`);
      continue;
    }
    const translation = readLocale(file);
    for (const [key, value] of source.leaves) {
      const translated = translation.leaves.get(key);
      if (translated === undefined) {
        if (translation.groups.has(key)) {
          report(
            file,
            lineOf(translation.text, key),
            "shape",
            `"${key}" is a string in ${SOURCE}.json`,
          );
        } else report(file, 1, "missing", `"${key}"`);
      } else if (placeholders(value) !== placeholders(translated)) {
        const expected = placeholders(value) || "none";
        report(
          file,
          lineOf(translation.text, key),
          "placeholders",
          `"${key}" should use ${expected}`,
        );
      }
    }
    for (const key of translation.leaves.keys()) {
      if (source.leaves.has(key)) continue;
      if (source.groups.has(key)) {
        report(
          file,
          lineOf(translation.text, key),
          "shape",
          `"${key}" is a group in ${SOURCE}.json`,
        );
      } else
        report(file, lineOf(translation.text, key), "extra", `"${key}" isn't in ${SOURCE}.json`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} translation problem(s). See src/shared/core/i18n/README.md.`);
  process.exit(1);
}
