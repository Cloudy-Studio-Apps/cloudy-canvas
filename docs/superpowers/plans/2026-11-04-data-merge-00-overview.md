# Data sources and data merge: overview and file tree

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md)

Five plans, one per phase of the spec, in order. Each ships on its own (lint, typecheck, format,
changelog entry) and the next builds on it.

| Phase | Plan                                                             | Ships                                                                                         |
| ----- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1     | [Sources](2026-11-04-data-merge-01-sources.md)                   | The `data` module, file and HTTP sources, CSV and JSON, Update, the Data tab, agent tools     |
| 2     | [Bindings](2026-11-04-data-merge-02-bindings.md)                 | Text tokens, field bindings, formats, conditions, images into assets, preview row             |
| 3     | [Element iterator](2026-11-04-data-merge-03-element-iterator.md) | Repeat on a frame, row keys, filter, sort, limits, Detach, data checks                        |
| 4     | [Page iterator](2026-11-04-data-merge-04-page-iterator.md)       | Repeat this page, rows per page, group by into sections, counted pages, export prompt/scratch |
| 5     | [Finish](2026-11-04-data-merge-05-finish.md)                     | Excel, the Shape step, API pagination, an example plugin, plugin docs                         |

## Rules every plan follows

- **No test framework** (CLAUDE.md): a task's check is `pnpm typecheck && pnpm lint && pnpm
format:check` passing. Types are written first so the type checker catches contract slips
  between tasks. Pure functions stay pure (no engine, no React) so they're easy to reason about.
- Read each touched folder's `README.md` up to `src/` before changing it; update it in the same task.
- One file per component, tool, helper; every `interface`/`type` in a sibling `.types.ts`.
- User text through `t` (`data.i18n.ts`, `locales/en.json` + `es.json`); MCP text stays English.
- Commits on `master`, no co-author line (memory: work on master, no Claude co-author).
- Each phase's last task adds its `CHANGELOG.md` + `CHANGELOG.es.md` entry under the unreleased
  section.

## Decisions the plans share (made while planning)

- **Module:** `src/products/design/modules/data/`, id `data`, tier `core`, requires `core`,
  `pages`, `frame`; uses `text`, `image`, `auto-layout`. Listed in
  `ui/modules/design-modules.ts` right after `frameModule` and before `catalogModule`.
- **afterEdit order doesn't matter for correctness:** every `afterEdit` write re-runs the hooks
  until nothing changes (as `syncPageItems` relies on), so the catalog's page sync, the data sync
  and the page-items sync converge whatever their order. Each sync writes only differences, so it
  ends.
- **Platform reach:** engine code never imports `@platform`. The `data` module's session hook
  (`ui/hooks/use-data-services.ts`) hands a `DataServices` (http, readFile, pickFile, secrets) and
  the registered source types and formats to the `DESIGN_DATA_SOURCES` service
  (`setContext(…)`, `null` when the editor closes). Agent tools read it
  from there too, so they work while an editor is open, which is always the case for agents.
- **Libraries:** `papaparse` (CSV, MIT) in phase 1; `read-excel-file` (Excel, MIT), loaded with a
  dynamic `import()`, in phase 5. No virtual-list library: the table shows at most 200 rows with a
  "Showing 200 of N" line (YAGNI; the spec's virtualized table is satisfied by not rendering all).
- **Secrets:** a `SecretStore` (`shared/core`) implemented in `platform/secret-store.ts`: a
  `secrets.json` in the app data folder on desktop, `localStorage` in the browser. Keys are
  `data-source:<sourceId>:<settingKey>`. Not encrypted (OS keychain left for later; noted in the
  README).
- **Text templates** need the text editor to edit the template, not the resolved text: phase 2
  adds a `textTemplates` point to the **text** module (owned there, read by its editor), which
  `data` contributes to.

## File tree

`+` create, `~` modify, `-` delete. The phase that touches it is in brackets.

```
package.json                                                    ~ [1] papaparse, @types/papaparse [5] read-excel-file
pnpm-lock.yaml                                                  ~ [1][5]
CHANGELOG.md, CHANGELOG.es.md                                   ~ [1][2][3][4][5]
docs/
  catalog-roadmap.md                                            ~ [5] C2 ticked, done
  plugins.md                                                    ~ [5] data sources and formats for plugins
  superpowers/plans/2026-11-04-data-merge-*.md                  - [5] deleted when the work is done (memory: delete finished plans)
examples/plugins/
  sample-products-source/                                       + [5] a plugin registering a source type
    manifest.json, main.js, README.md                           + [5]
src/
  shared/core/
    index.ts                                                    ~ [1] export secrets types
    links/links.types.ts                                        ~ [1] HttpClient.request, HttpRequest, HttpResponse
    secrets/secret-store.types.ts                               + [1]
    secrets/index.ts                                            + [1]
  canvas/document/
    canvas-document.ts, README.md                               ~ [4] fork()
  platform/
    http.ts                                                     ~ [1] request()
    file-dialog.ts (or where openFile lives)                    ~ [2] pickFolder()
    secret-store.ts                                             + [1]
    index.ts                                                    ~ [1] export secretStore
  products/design/
    modules/index.ts                                            ~ [1] export * from "./data"
    ui/modules/design-modules.ts                                ~ [1] dataModule after frameModule, before catalogModule
    modules/text/
      text.points.ts, text.points.types.ts                      + [2] textTemplates point
      ui/… (the text editor's open/commit)                      ~ [2] edits a template when one claims the layer
      text.module.ts, index.ts, README.md                       ~ [2]
    modules/data/                                               + [1] the module
      README.md, data.module.ts, data.i18n.ts, index.ts         + [1]
      locales/en.json, locales/es.json                          + [1] (grown in every phase)
      data.points.ts, data.points.types.ts                      + [1] dataSourceTypes, dataFormats
                                                                ~ [4] dataScopeProviders, dataLocaleProviders
      source/                                                   + [1] the record
        data-source.constants.ts, data-source.types.ts
        data-source.defaults.ts, data-source.kind.ts
        data-source.factory.ts, is-data-source.ts, index.ts
      settings/                                                 + [1] declarative settings
        setting-spec.types.ts, read-settings.ts, index.ts
      table/                                                    + [1]
        data-table.types.ts, read-path.ts, read-path.types.ts
        normalize-rows.ts, guess-fields.ts, index.ts
        shape-rows.ts, shape.types.ts                           + [5]
      formats/                                                  + [1]
        csv.format.ts, json.format.ts, detect-format.ts, index.ts
        xlsx.format.ts                                          + [5]
      sources/                                                  + [1]
        file.source.ts, http.source.ts, index.ts
        http-pagination.ts, http-pagination.types.ts            + [5]
      services/                                                 + [1]
        data-services.types.ts, index.ts
      update/                                                   + [1]
        snapshot.ts, snapshot.types.ts, update-source.ts
        update-source.types.ts, index.ts
        download-images.ts, download-images.types.ts            + [2]
      model/                                                    + [1]
        design-data-sources.ts, design-data-sources.types.ts
        source-name.ts, index.ts
      bindings/                                                 + [2]
        binding.types.ts, binding-fields.ts
        scope.ts, scope.types.ts
        parse-tokens.ts, parse-tokens.types.ts
        resolve-template.ts, format-value.ts, format-value.types.ts
        evaluate-condition.ts, plan-bindings.ts, bind-data.ts
        rename-references.ts, index.ts
        bound-text-template.ts                                  + [2] the textTemplates entry
      repeat/                                                   + [3]
        repeat.types.ts, repeat-fields.ts, repeat-rows.ts
        plan-data-copies.ts, plan-data-copies.types.ts, copy-node.ts, data-resolved-paths.ts,
        mirror-field.ts, order-keys.ts, template-parts.ts, row-names.ts, sort-rows.ts
        write-data-copies.ts, set-repeat.ts, detach-data-copy.ts
        prepare-data-copies.ts, prune-data.ts, index.ts
      sync/                                                     + [2] (grows in [3])
        sync-data.ts, affected-data.ts, index.ts
      checks/                                                   + [3]
        data-issues.ts, data-issues.types.ts, index.ts
      mcp/                                                      + [1]
        source-args.ts, describe-source.ts, data-sources.mcp.ts, index.ts
        bind-data.mcp.ts                                        + [2]
        repeat.mcp.ts                                           + [3]
      ui/                                                       + [1]
        index.ts, data.points.ts, data.points.types.ts          + [1] dataSourceForms
        hooks/use-data-sources.ts, hooks/use-data-services.ts   + [1]
        hooks/use-update-source.ts                              + [1]
        data-tab/                                               + [1]
          data-tab.tsx, source-list.tsx, source-row.tsx
          add-source-menu.tsx, source-detail.tsx
          settings-form.tsx, setting-field.tsx
          field-list.tsx, field-row.tsx, rows-table.tsx
          update-button.tsx, *.types.ts
          shape-step.tsx, shape-step.types.ts                   + [5]
        data-section/                                           + [2] properties panel
          data-section.tsx, text-template-field.tsx
          bind-field-row.tsx, condition-field.tsx
          field-picker.tsx, *.types.ts
          preview-row-field.tsx                                 + [3]
        repeat-section/                                         + [3]
          repeat-section.tsx, filter-rows.tsx, sort-rows.tsx, *.types.ts
        design-mode/                                            + [3]
          data-copy-badge.tsx, data-copy-section.tsx, *.types.ts
    modules/catalog/
      catalog.module.ts                                         ~ [4] uses: data; data-pages sync, checks
      catalog.mode.ts                                           ~ [1] rail.keep: ["data"]
      README.md                                                 ~ [4]
      brochure/brochure.types.ts                                ~ [4] BrochureSlot.repeat, .generated
      brochure/brochure.kind.ts                                 ~ [4] fillDefaults untouched slots
      model/data-pages/                                         + [4]
        page-repeat.types.ts, plan-data-pages.ts
        plan-data-pages.types.ts, count-data-pages.ts
        sync-data-pages.ts, data-page-scope.ts, index.ts
      model/book-layout.ts, book-layout.types.ts                ~ [4] pending pages counted
      model/brochure-pages.ts                                   ~ [4] pending pages
      model/sections/ (sectionsWithData), TOC                   ~ [4] group sections, derived
      mode/delete-selected-pages.ts                             ~ [4] generated pages detach
      export/printed-pages.ts                                   ~ [4] pending sides refused
      ui/preview/…                                              ~ [4] pending sides as blank paper
      ui/brochure-tab/use-page-list-drag.ts                     ~ [4] generated rows don't move
      mcp/brochure-read.mcp.ts                                  ~ [4] generated and pending in get_brochure
      model/numbering/page-numbers.ts                           ~ [4] counts pending pages
      model/design-brochure.ts, design-brochure.types.ts        ~ [4] setRepeat, pendingPages
      checks/check-brochure.ts                                  ~ [4] data issues
      export/scratch-document.ts, scratch-document.types.ts     + [4]
      export/export-brochure.ts, export-brochure.types.ts       ~ [4] full generation on a scratch copy
      ui/sidebar/page-repeat-section.tsx, *.types.ts            + [4]
      ui/brochure-tab/pending-pages-row.tsx, *.types.ts         + [4]
      ui/brochure-tab/page-tree… (where rows are built)         ~ [4] the pending row
      ui/hooks/use-export-brochure.ts                           ~ [4] asks before export
      ui/export-data-dialog.tsx, export-data-dialog.types.ts    + [4]
      mcp/brochure-data.mcp.ts                                  + [4] set_/remove_brochure_page_repeat
      mcp/brochure-settings.mcp.ts                              ~ [4] export_brochure_pdf updateSources
      mcp/index.ts, locales/*.json                              ~ [4]
```

Nothing is deleted from the app's code; the only deletions are these plan files once phase 5 ships.
