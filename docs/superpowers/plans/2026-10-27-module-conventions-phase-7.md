# Module conventions, phase 7 (proof) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (the user runs phases inline, no subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the plugin API is complete by copying `shader-effect` and `catalog` to `examples/plugins/` as real plugins, written in TypeScript with their own folder structure and built by a new `pnpm plugin:build` command, and open every gap they hit.

**Architecture:** A small plugin kit in `scripts/plugin-kit/` bundles a plugin's `src/` (any structure, TS/TSX) with rolldown into the one `main.js` the loader already takes (format and API v1 unchanged). Every app import is replaced by a virtual module that reads the `api` handed to `activate`: barrels map to `api` groups by name, a module path (`@design/modules/<id>(/ui)`) reads the product barrel first and `host.require(id)` for the rest, filled when the plugin's module registers. The copies change only their import lines and their ids (they sit beside the built-ins); what they still can't reach is opened in core.

**Tech Stack:** Node ESM scripts, rolldown 1.2.14 (already in the pnpm store through vite 8.3.4), TypeScript, React 19.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§12 phase 7, §14).

## Global Constraints

- Git is the user's: no commits or branches; use `mv`, not `git mv`. The phase ends with a commit message for the user.
- Verification: `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, plus `pnpm plugin:build` on the two examples (it is this phase's deliverable). No `tauri dev`, cargo, app builds or browser checks.
- No legacy code or aliases. `PLUGIN_API_VERSION` stays 1; the loader's format (one `main.js`, `activate(api)`) doesn't change.
- User-facing text goes through the folder's `t` (rule 30); the copies keep their `locales/en.json` and `es.json` with the Spanish text. MCP tool text stays English.
- Never delete the i18n docs (`docs/superpowers/specs/2026-10-27-i18n-design.md`, i18n plans, `.superpowers/sdd/2026-10-27-i18n/`).
- UI: sharp radii, semantic tokens (unchanged copies already follow them).
- Copies sit beside the built-ins: their ids, element types, mode, tools, commands, MCP tool names and persisted store names are renamed so nothing clashes.

## Review Focus

1. An import the kit can't map (`@app/…`, `@pages/…`, a deep module path `@design/modules/frame/frame-presets`): the build must fail naming the file, the import and why, never emit a `main.js` that fails later.
2. A name missing from the api group it maps to: activate must throw naming it (`api.design.X isn't part of the plugin API`), which `strictApi` already does when the shim reads it eagerly; the kit must read barrel names eagerly, not lazily.
3. A value from `host.require` read at a file's top level (before register): it is `undefined` then. The kit's README states the rule; the smoke check (Task 3) must catch it for the two copies.
4. JSX: `.tsx` files compile to `react/jsx-runtime` calls; `key` must survive (`jsx(type, props, key)`), or lists re-render wrongly.
5. Two plugins built by the kit loaded together: no shared global, each bundle closes over its own `api`.

---

### Task 1: `host.require` of core modules without listing them

**Files:**

- Modify: `src/shared/core/modules/module-host.ts` (`require`, ~line 66)
- Modify: `src/shared/core/modules/README.md`, `docs/plugins.md` ("Using another module")

**Interfaces:**

- Produces: `host.require(id)` works for any module whose `tier` is `"core"` even when it isn't in `requires`/`uses` (mirrors import rule: core modules are importable by every module). Other modules still need listing.

- [ ] **Step 1:** In `require`, skip the listing check when `byId.get(moduleId)?.tier === "core"`. Error texts stay exactly as they are.
- [ ] **Step 2:** README and docs/plugins.md: "a core module can be required without listing it; any other must be in `requires` or `uses`."
- [ ] **Step 3:** `pnpm lint && pnpm typecheck` → pass.

### Task 2: Effect types a plugin can add with their own data

Today the agent field readers (`FIELDS`, `effectReader`) only take the built-in `DesignEffectType`, so a plugin effect type (`"shader-lab"`) can't reuse them.

**Files:**

- Modify: `src/products/design/modules/effects/effect-args.ts`
- Create: `src/products/design/modules/effects/effect-args.types.ts` (`EffectFieldReader`)
- Modify: `src/products/design/modules/effects/index.ts`, its `README.md`

**Interfaces:**

- Produces (from `@design` and `host.require("effects")`):
  - `type EffectFieldReader = (value: unknown, at: string) => unknown`
  - `EFFECT_FIELDS: Record<DesignEffectType, Record<string, EffectFieldReader>>` (today's `FIELDS`, exported)
  - `readEffectFields(type: string, defaults: Record<string, unknown>, fields: Record<string, EffectFieldReader>): EffectReader` — today's body of `effectReader`, with the type, defaults and fields as parameters
  - `effectReader(type: DesignEffectType)` stays, as `readEffectFields(type, EFFECT_DEFAULTS[type], EFFECT_FIELDS[type])`

- [ ] **Step 1:** Implement the above; `EFFECT_TYPES` keeps reading the built-in keys.
- [ ] **Step 2:** effects README: a plugin effect type reads agents' fields with `readEffectFields(myType, myDefaults, { ...EFFECT_FIELDS.shader })` and `setEffectReader`.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck` → pass (check-public-api still passes; the new names are in the barrel).

### Task 3: The plugin kit and `pnpm plugin:build`

**Files:**

- Create: `scripts/plugin-kit/build-plugin.mjs` (CLI: reads the folder, runs rolldown, writes `main.js`)
- Create: `scripts/plugin-kit/api-imports.mjs` (the import → api table and the virtual modules' code)
- Create: `scripts/plugin-kit/README.md`
- Create: `examples/plugins/tsconfig.json` (types for the examples' `src/`)
- Modify: `package.json` (`rolldown` devDependency `1.2.14`; `"plugin:build": "node scripts/plugin-kit/build-plugin.mjs"`; `typecheck` adds `&& tsc -p examples/plugins/tsconfig.json`)
- Modify: `.prettierignore`, `eslint.config.js` ignores (the built `examples/plugins/shader-lab/main.js`, `examples/plugins/catalog-plugin/main.js`, by name: callout's hand-written `main.js` stays checked)

**Interfaces:**

- Produces: `pnpm plugin:build <folder>` builds `<folder>/src/main.ts` (or `main.tsx`) into `<folder>/main.js` and prints its size, or exits 1 with one line per problem. The entry's default export is what `activate` returns (a module, a list, or `{ board, design }`).

**The import table** (`api-imports.mjs`, first match wins; type-only imports are erased by the transform and never reach it):

| Import                                                | Becomes                                                                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `@design/modules/<id>`, `@design/modules/<id>/ui`     | module `design`/`<id>` (below)                                                                                                                 |
| `@board/modules/<id>`, `@board/modules/<id>/ui`       | module `board`/`<id>`                                                                                                                          |
| `@design/modules/<id>/<anything else>` (and board)    | **error**: deep import, use the module's `index.ts` or `ui/index.ts`                                                                           |
| `@design`, `@design/…`                                | group `api.design`                                                                                                                             |
| `@board`, `@board/…`                                  | `api.board`                                                                                                                                    |
| `@canvas`, `@canvas/…`                                | `api.canvas`                                                                                                                                   |
| `@canvas-ui`, `@canvas-ui/…`                          | `api.canvasUi`                                                                                                                                 |
| `@shared/core`                                        | `api.core`                                                                                                                                     |
| `@shared/ui/kit`                                      | `api.ui.kit`                                                                                                                                   |
| `@shared/…`, `@platform`, `@platform/…`               | each name from `api.ui`, else `api.platform`                                                                                                   |
| `@app/…`, `@pages/…`, any other `@`-alias of tsconfig | **error**: not part of the plugin API                                                                                                          |
| `react`                                               | default and named from `api.libs.React`                                                                                                        |
| `react/jsx-runtime`                                   | `jsx`, `jsxs`: `(type, props, key) => React.createElement(type, key === undefined ? props : { ...props, key })`; `Fragment` = `React.Fragment` |
| `react-dom`                                           | `createPortal` from `api.libs`                                                                                                                 |
| `lucide-react`                                        | each name from `api.libs.icons`                                                                                                                |
| `zustand`                                             | `create` = `api.libs.createStore`                                                                                                              |
| `zustand/middleware`                                  | `persist` = `api.libs.persist`                                                                                                                 |
| `@codemirror/language`                                | `StreamLanguage` = `api.libs.StreamLanguage`                                                                                                   |
| a name of these libraries not listed                  | **error**: bundle it yourself or ask for it in `api.libs`                                                                                      |
| relative imports, other npm packages                  | bundled as usual                                                                                                                               |

- A **group** virtual module reads each imported name eagerly: `export const X = __api.design.X;` (strictApi throws naming a missing one at activate).
- A **module** virtual module, for each name: `export let X = "X" in __api.design ? __api.design.X : undefined;` plus a late binding registered with `__late("<id>", (m) => { if (!("X" in __api.design)) X = m.X; })`. A name the module doesn't export throws at register: `The module "<id>" has no export "X" (imported by the plugin).`
- `__api` and `__late` are free identifiers the bundle closes over. The kit bundles with rolldown `format: "iife"`, `name: "__plugin"`, then writes:

```js
// Built by scripts/plugin-kit from src/. Don't edit: run `pnpm plugin:build <folder>`.
export default function activate(__api) {
  const __bindings = [];
  const __late = (id, bind) => __bindings.push({ id, bind });
  <rolldown's iife output>
  const bind = (host) => { for (const b of __bindings.splice(0)) b.bind(host.require(b.id)); };
  const wrap = (m) => ({ ...m, register(host) { bind(host); return m.register(host); } });
  const result = __plugin.default;
  if (Array.isArray(result)) return result.map(wrap);
  if (result && typeof result.register === "function") return wrap(result);
  if (result) return Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.map(wrap)]));
  return result;
}
```

`bind` runs once, in the first of the plugin's modules to register (its `requires`/`uses`, or the core tier from Task 1, decide what it may require).

- [ ] **Step 1:** `pnpm add -D rolldown@1.2.14`; check `node -e "import('rolldown').then(r=>console.log(typeof r.rolldown))"` prints `function`.
- [ ] **Step 2:** Write `api-imports.mjs` (the table as data + `resolveApiImport(spec): { kind: "group" | "module" | "lib" | "error", … } | null`) and `build-plugin.mjs` (a rolldown plugin whose `resolveId` maps table hits to `\0cloudy:<spec>` and `load` generates their code. `load` doesn't get the importers' names, so before bundling, a first pass parses every file in `src/` with the TypeScript parser (already a dependency) and collects, per specifier, the value names imported (`default`, named; `import *` of an app alias is an error: name what you use). Each virtual module exports exactly those names. JSX: rolldown's `transform.jsx: "react-jsx"`. tsconfig paths for `@…` are not resolved by rolldown: the table owns them.
- [ ] **Step 3:** `examples/plugins/tsconfig.json`: the root's compiler options, `paths` pointing at `../../src/…` (same aliases as the root), `include: ["*/src"]`.
- [ ] **Step 4:** README (`scripts/plugin-kit/README.md`): a plugin's layout (`plugin.json`, `locales/`, `src/main.ts` default-exporting the module(s)), the table, the top-level rule ("values that come from `host.require` are read inside functions, never at a file's top level"), the errors, and that it may become an npm package once API v1 is stable.
- [ ] **Step 5:** Error check: a scratchpad folder whose `src/main.ts` imports `@app/plugins` and `@design/modules/frame/frame-presets` → `pnpm plugin:build <it>` exits 1 with two lines naming both. Delete the folder.
- [ ] **Step 6:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.

### Task 4: `shader-lab`, the shader effect as a plugin

**Files:**

- Create: `examples/plugins/shader-lab/plugin.json` (`id: "shader-lab"`, `products: ["design"]`, `apiVersion: 1`, `main: "main.js"`), `README.md`, `src/` (a copy of `src/products/design/modules/shader-effect/`, its `README.md` left out), `src/main.ts` (`export default shaderLabModule`), built `main.js`
- Create: `src/shader-lab-effect.types.ts` in the copy (`ShaderLabEffect extends NodeEffect { type: "shader-lab"; code: string; params: Record<string, number | number[]> }`)

**Changes allowed in the copy** (anything else is a gap, see Task 6):

- Import lines: relative paths out of the folder become aliases (`../effects` → `@design/modules/effects`, `../effects/ui` → `@design/modules/effects/ui`, `../core` → `@design/modules/core`, `../../design-points` → `@design`); `@shared/ui/components/code-editor` stays (the table maps it).
- Ids: module `id: "shader-lab"`, `tier` removed, `requires: ["effects"]` kept; effect type `"shader-lab"` (renderer `type`, `setEffectReader`, `defineEffectType` `type`); `ShaderEffect` → `ShaderLabEffect`; `create` builds `{ id: createId(), type: "shader-lab", visible: true, code: DEFAULT_SHADER_CODE, params: {} }`; the reader is `readEffectFields("shader-lab", { code: "", params: {} }, EFFECT_FIELDS.shader)` (Task 2); module and file names `shader-effect` → `shader-lab`; locales `title` → "Shader lab" / "Laboratorio de shaders".

- [ ] **Step 1:** Copy, then make only the changes above.
- [ ] **Step 2:** `pnpm plugin:build examples/plugins/shader-lab` → writes `main.js`, exit 0.
- [ ] **Step 3:** Smoke check (scratchpad script, not committed): import the built `main.js` in Node with a fake `api` (Proxies whose groups answer every name with a callable stub, `has` true except for names the effects module's `ui/index.ts` exports) and a fake `host` (`require` returns stubs, `contribute` records); call `activate`, then `register`. It returns one module `shader-lab` and contributes to the renderer and effect-type points without throwing.
- [ ] **Step 4:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.

### Task 5: `catalog-plugin`, the Catalog mode as a plugin

**Files:**

- Create: `examples/plugins/catalog-plugin/plugin.json` (`id: "catalog-plugin"`, `products: ["design"]`), `README.md`, `src/` (a copy of `src/products/design/modules/catalog/`, its `README.md` left out), `src/main.ts` (`export default catalogPluginModule`), built `main.js`

**Changes allowed in the copy:**

- Import lines: relative paths out of the folder become aliases (`../frame`, `../frame/ui`, `../pages`, `../image`, `../text`, `../core`, `../layers/ui` → `@design/modules/<id>(/ui)`; `../../design-points`, `../../design-engine.types`, `../../design-options.types`, `../../mcp` → `@design`).
- Ids: module `catalog-plugin` (`tier` removed; `requires`/`uses` kept); migration `catalog-plugin.brochures`; `designMcpTools` entry `catalog-plugin`; `BROCHURE_TYPE` `"plugin-brochure"`; `CATALOG_MODE_ID` `"catalog-plugin"`, `CATALOG_TOOL` `"catalog-plugin"`, `CATALOG_PICK_TOOL` `"catalog-plugin-pick"`, `CATALOG_COMMANDS` `catalog-plugin.pick|preview|exportPdf`; rail tab `plugin-brochure`; every MCP tool name prefixed `plugin_` (`plugin_list_brochures`, …, and where descriptions name another tool); every persisted store `name` prefixed `catalog-plugin.`; locales `mode.label` → "Catalog (plugin)" / "Catálogo (plugin)". Find the rest with `grep -rn '"catalog\|"brochure' src/`.

- [ ] **Step 1:** Copy, then make only the changes above.
- [ ] **Step 2:** `pnpm plugin:build examples/plugins/catalog-plugin` → exit 0.
- [ ] **Step 3:** Smoke check as in Task 4 (names not in `api.design` come from `host.require` of frame, layers, …): `activate` and `register` don't throw, the mode is contributed.
- [ ] **Step 4:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.

### Task 6: Open the gaps the copies hit

**Files:** wherever the gap is; the ledger lists each.

- [ ] **Step 1:** For every change Tasks 4–5 needed beyond imports and ids, and every build/smoke error: export the missing name from its barrel or module `index.ts`/`ui/index.ts` (rule 18), or add it to `app/plugins/api/` (`ui`, `platform`, `libs`), or, when it is an app assumption a plugin can't meet, change core. Then undo the copy's workaround and rebuild.
- [ ] **Step 2:** `grep -rn "catalogModule\|shaderEffectModule\|\"catalog\"\|\"shader\"" src/ --include=*.ts --include=*.tsx` outside the two modules: anything reading them by id is a gap (a plugin couldn't be listed there); record or fix.
- [ ] **Step 3:** All verification passes; both examples rebuilt.

### Task 7: Docs

**Files:**

- Modify: `docs/plugins.md` (new section "Writing a plugin in TypeScript": layout, imports by the app's aliases, `pnpm plugin:build`, the top-level rule, the two examples; Format section says `main.js` may be built)
- Modify: `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§12 phase 7 done; new §14.7 "Done in phase 7": the kit, the gaps opened, the npm package as a later step)
- Modify: `CLAUDE.md` Commands (`pnpm plugin:build <folder>`)
- Modify: `src/app/plugins/README.md` (points to the kit)
- Memory `module-conventions.md` and `MEMORY.md`: "phases 1-7 done"

- [ ] **Step 1:** Write the above.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Report, rulings and commit message to the user.
