# Translations (i18n)

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md); the design is in
[docs/superpowers/specs/2026-10-27-i18n-design.md](../../../../docs/superpowers/specs/2026-10-27-i18n-design.md)._

English is the source language and the fallback; Spanish is the one translation (`SUPPORTED_LOCALES`).

## A folder's translator

Every folder that shows text (a module, a page, an area like `canvas-ui`) owns its strings:

```
<folder>/
  locales/en.json      the English strings: the source of truth, and where the keys come from
  locales/es.json      the same keys in Spanish
  <name>.i18n.ts       export const t = defineMessages({ en, es });
```

- **Keys are grouped**: nest objects for related strings and call the dot path,
  `t("panel.add.active")`; a top-level string is `t("title")`. Keys are typed from `en.json`
  (`MessageKey`), so a typo or a path that ends at a group fails `pnpm typecheck`.
- **Placeholders**: `{name}` in the text, `t("gap", { size: 8 })`. One without a value stays as is.
- **Plurals**: sibling strings `<key>_one` / `<key>_other` (any `Intl.PluralRules` category), called
  as `t("<key>", { count })`; `_other` is the fallback form.
- **Fallback**: a string missing in Spanish shows the English one. A key missing from both (only a
  plugin's untyped keys or a cast can do that) shows `⟦key⟧` in dev, with one console warning, and
  the plain key in production.
- **Generic words** (Cancel, Save, Delete, Close, Rename, Duplicate, Done) are `tCommon`
  (`common/`); anything more specific belongs to the folder, even when another says it too.
- **Stays English**: MCP tool names and descriptions, ids, element types, file formats, key caps,
  "Cloudy Canvas", and developer messages (thrown `Error`s, `console`).

## The locale

`setLocale` runs once at boot, in `app/i18n-boot.ts` (the first import of `main.tsx`), from the
user's choice (`shared/stores/locale-store.ts`: `system`, `en` or `es`) and `navigator.languages`
(`resolveLocale`, `matchLocale`: `es-419`, `es_PE` and `ES` are Spanish; anything unsupported is
English). A change in Settings › Language applies after Restart now (which saves, then reloads the window) or on the next launch, so `t()` is a plain function:
engine code and top-level constants (a module's command labels) can call it, and nothing
re-renders. `t()` before `setLocale` shows English and warns once in dev. `getLocale()` gives the
locale to `Intl` formatters.

## Product names and default names

- A product's `noun` (`CanvasFileFormat`, `CanvasFileSource`) is translated by the product, and in
  Spanish it carries its article ("la pizarra", "el diseño"), so shared sentences in `canvas-ui`
  need no grammatical gender: "No se pudo guardar {noun}". The same goes for a subject passed into a
  phrase, like `ColorControls`' `label` ("la parada" → "Matiz de la parada").
- Default names of new things (pages, layers, mask groups, booleans, collections, the design system
  page, untitled files) follow the creator's language and are saved as they are, like Figma.
  Names the code looks up by name stay English, as identifiers (the color wizard's collections,
  axis and groups).

## The lint checks

- `scripts/check-locales.mjs` (in `pnpm lint`): `es.json` has every key of `en.json`, with the same
  placeholders and plural pairs.
- `cloudy/no-literal-ui-text` (`scripts/eslint/no-literal-ui-text.js`, an error in every `.tsx`):
  JSX text and the string values of `label`, `title`, `description`, `placeholder`, `aria-label`
  and similar props and option fields must come from a translator. Brand names, "Aa", strings
  without words, all-caps abbreviations, units, URLs, paths and expressions pass, as does text in
  `<code>` and `<Kbd>`. Sample content (the color wizard's previews, type and diagram samples) is
  ignored in `eslint.config.js`; a one-off says why with
  `eslint-disable-next-line cloudy/no-literal-ui-text -- <why>`. Plain `.ts` files aren't checked.

## Not translated yet

- Figma and FigJam import warnings (`products/design/figma`, `products/board/figjam`): built in a
  worker, which has no locale, often from type names. They need message codes the UI translates.
- DBML and ER syntax and reconcile errors (`board/modules/db/schema/dbml`, `board/modules/er`):
  thrown `Error`s that the editors show.
