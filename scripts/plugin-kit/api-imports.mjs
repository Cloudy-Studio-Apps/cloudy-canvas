// What a plugin's imports of the app become (scripts/plugin-kit/README.md): every app alias and
// shared library maps to the `api` handed to `activate`, which the built bundle closes over as
// `__api`. `resolveApiImport(spec)` says where an import goes (or null: bundle it as usual), and
// `apiModuleCode(target, names)` writes the virtual module that hands out those names.

/** Libraries the app shares through `api.libs`: each name a plugin may import, and where it is. */
const LIBS = {
  react: (name) => (name === "default" ? "__api.libs.React" : `__api.libs.React.${name}`),
  "react-dom": (name) => (name === "createPortal" ? "__api.libs.createPortal" : null),
  "lucide-react": (name) => (name === "default" ? null : `__api.libs.icons.${name}`),
  zustand: (name) => (name === "create" ? "__api.libs.createStore" : null),
  "zustand/middleware": (name) => (name === "persist" ? "__api.libs.persist" : null),
  "@codemirror/language": (name) =>
    name === "StreamLanguage" ? "__api.libs.StreamLanguage" : null,
};

/** The JSX runtime `.tsx` files compile to, on the app's React (`key` is passed as a prop). */
const JSX_RUNTIME = `const React = __api.libs.React;
const jsx = (type, props, key) =>
  React.createElement(type, key === undefined ? props : { ...props, key });
export { jsx, jsx as jsxs };
export const Fragment = React.Fragment;`;

/** App aliases in the order they're tried: `[pattern, target]`. */
const ALIASES = [
  [
    /^@(design|board)\/modules\/([^/]+)(\/ui)?$/,
    (m) => ({ kind: "module", product: m[1], id: m[2] }),
  ],
  [
    /^@(design|board)\/modules\/([^/]+)\/.+$/,
    (m) => ({
      kind: "error",
      message: `a deep import: use the ${m[2]} module's index.ts or ui/index.ts ("@${m[1]}/modules/${m[2]}" or "…/${m[2]}/ui")`,
    }),
  ],
  [/^@design(\/.*)?$/, () => ({ kind: "group", path: "design" })],
  [/^@board(\/.*)?$/, () => ({ kind: "group", path: "board" })],
  [/^@canvas-ui(\/.*)?$/, () => ({ kind: "group", path: "canvasUi" })],
  [/^@canvas(\/.*)?$/, () => ({ kind: "group", path: "canvas" })],
  [/^@shared\/core$/, () => ({ kind: "group", path: "core" })],
  [/^@shared\/ui\/kit$/, () => ({ kind: "group", path: "ui.kit" })],
  [/^(@shared\/.+|@platform(\/.*)?)$/, () => ({ kind: "pick", paths: ["ui", "platform"] })],
  [
    /^@(app|pages)(\/.*)?$/,
    () => ({ kind: "error", message: "not part of the plugin API (the app's shell and pages)" }),
  ],
];

/**
 * Where an import goes: `{ kind: "group", path }` (an api group), `{ kind: "pick", paths }` (each
 * name from the first group that has it), `{ kind: "module", product, id }`, `{ kind: "lib",
 * name }`, `{ kind: "jsx" }`, `{ kind: "error", message }`, or null for a relative import or
 * another npm package, which is bundled.
 */
export function resolveApiImport(spec) {
  if (spec === "react/jsx-runtime") return { kind: "jsx" };
  if (spec in LIBS) return { kind: "lib", name: spec };
  for (const [pattern, target] of ALIASES) {
    const match = spec.match(pattern);
    if (match) return target(match);
  }
  return null;
}

/** Why a name can't be imported from `target`, or null when it can. */
export function nameProblem(target, name) {
  if (target.kind === "lib" && !LIBS[target.name](name)) {
    return `${name} from "${target.name}" isn't in api.libs: bundle the library yourself or ask for it in api.libs`;
  }
  if (target.kind !== "lib" && name === "default") return "app modules have no default export";
  return null;
}

/** The virtual module for `target`, exporting `names` (the value names the plugin imports). */
export function apiModuleCode(target, names) {
  if (target.kind === "jsx") return JSX_RUNTIME;
  const lines = [];
  const exportAs = (local, name) =>
    name === "default" ? `export default ${local};` : `export { ${local} as ${name} };`;
  names.forEach((name, i) => {
    const local = `_${i}`;
    if (target.kind === "lib") {
      lines.push(`const ${local} = ${LIBS[target.name](name)};`);
    } else if (target.kind === "group") {
      // Read now: a name the api lacks throws when the plugin starts, naming it.
      lines.push(`const ${local} = __api.${target.path}.${name};`);
    } else if (target.kind === "pick") {
      const from = target.paths.map(
        (path) => `"${name}" in __api.${path} ? __api.${path}.${name} : `,
      );
      const missing = `(() => { throw new Error("${name} isn't in api.${target.paths.join(" or api.")}."); })()`;
      lines.push(`const ${local} = ${from.join("")}${missing};`);
    } else {
      // A module's name: from the product barrel now, else from host.require when it registers.
      const barrel = `__api.${target.product}`;
      lines.push(`let ${local} = "${name}" in ${barrel} ? ${barrel}.${name} : undefined;`);
      lines.push(
        `if (!("${name}" in ${barrel})) __late("${target.id}", (m) => { if (!("${name}" in m)) throw new Error('The module "${target.id}" has no export "${name}" (imported by the plugin).'); ${local} = m.${name}; });`,
      );
    }
    lines.push(exportAs(local, name));
  });
  return lines.join("\n");
}
