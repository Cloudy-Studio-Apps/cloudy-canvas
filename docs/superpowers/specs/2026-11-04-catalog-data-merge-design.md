# Data sources and data merge (catalog roadmap C2)

Status: design, waiting for approval. Roadmap item: [C2](../../catalog-roadmap.md#c2-a-catalog-built-from-data-data-merge).

## Intent

Let a design be filled from data. Someone has products (or anything) in a CSV, JSON or Excel file or
behind an API. They design one card or one page, bind its texts and images to fields, and say "repeat
this": the design fills as many cards and pages as the data needs. Pressing **Update** reads the data
again and every generated card and page follows.

Nobody needs it today; it's built for future users and for automatic catalogs: an agent (or a
person) points a source at a products API, presses Update, and exports a ready brochure.

The data side is **not a catalog-only feature**: sources and the element iterator belong to the
design file (a grid of social posts or a price list on one frame works the same way); only the page
iterator is a brochure thing.

## Goals

1. **Sources** of data in the file: from a local file (CSV, JSON, Excel) or an HTTP API, listed in a
   new **Data** tab, each with an **Update** button that works the same for every kind of source.
2. **Extensible like the rest of the app:** source types and formats are points; a plugin registers
   a new source (Google Sheets, Shopify, a database) or a new format (XML) and it works everywhere,
   with no special cases.
3. **Optional shaping** (the n8n-style node): by default fields are the raw paths of the data; a
   source can add a _Shape_ step that picks the list, renames fields and sets their types. Never
   required.
4. **Typed fields:** text, integer, number, currency, boolean, date, color, URL, image URL, image
   base64, image file name, list, object. The type decides how a value shows and what it can be bound
   to.
5. **Bindings:** tokens in text (`{product.name}`) and fields bound from the properties panel
   (an image fill to an image field, a color, visibility), with formatting per binding.
6. **Element iterator** ("Repeat" on a frame) and, in a brochure, **repeating sections and pages**
   (a group of pages per row; a page per row or per N rows of a list), all with filter, sort and an
   optional limit; nested, like loops in code.
7. **Design with a few, export all:** an iterator can show only N copies while designing; the export
   makes all of them, and page numbers, the table of contents and checks count the full set.
8. **Fetch only on demand:** nothing updates on its own. The export asks whether to update the
   sources first or use the saved data.
9. **Agents** can add, shape and update sources, bind layers and set iterators: the automatic
   catalog.

## Non-goals (this project)

- Automatic or scheduled updates, live sync, webhooks.
- Writing back to a source.
- Formulas and computed fields beyond the simple conditions and formats here.
- "As many as fit" pagination (flowing cards to the next page by measured height): pages take a fixed
  number of rows.
- Text per language from data (waits for C1; a field like `name_es` already works by binding it).
- A components system (the Assets tab is still a placeholder); iterators make their own copies.

## Anti-goals (failure even if it "works")

- Update silently overwriting what someone changed by hand.
- An API key or auth header saved in a `.cdesign`, and so shared with the file.
- A 5,000-row source bloating the undo history, collaboration traffic or the file's live data.
- Plugin sources being second-class: anything a built-in source does goes through the same points.
- An editor that freezes while an iterator makes hundreds of copies.

## Constraints

Everything in `CLAUDE.md` applies, in particular: a new module with its tier, `README.md`, i18n
(en + es) and changelog entries; engine code in plain TypeScript; content only in the Yjs doc through
`CanvasDocument`; platform access through `shared/core` interfaces; agent tools in `.mcp.ts` files,
one `asUndoStep` each, validated before writing; kit and `canvas-ui` pieces before new components.
Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check`.

## How it's built (decided)

### Modules

- **`data`** (design product, `products/design/modules/data/`), tier **core**: it owns the points
  plugins extend (`dataSourceTypes`, `dataFormats`) and adds fields other modules read (bindings).
  Requires `core`, `pages`, `frame`; uses `text`, `image`, `auto-layout`. It holds sources,
  snapshots, the Update pipeline, bindings, the element iterator, the Data tab and their agent tools.
- **`catalog`** gains `uses: data` for repeating sections and pages, the export prompt and data checks.

### Sources

A source is a record element, like a brochure (`DataSourceKind`, never drawn on a page), so undo,
copies and collaboration come for free:

```
DataSourceRecord {
  id, name                 // name: an identifier for tokens; made from the file or host name
                           // ("products"), editable, never required to be set by hand
  type                     // a dataSourceTypes id: "file", "http", or a plugin's
  settings                 // the type's settings, without secrets (path, url, method, headers' names…)
  format, formatOptions    // a dataFormats id ("csv", "json", "xlsx", …) or "auto"; delimiter, sheet…
  shape?                   // the optional Shape step (below)
  fields: DataField[]      // { path, alias?, type, format? } guessed at the first Update, then kept
  snapshot?                // { assetId, updatedAt, rowCount, hash }: the parsed data
  images                   // { [url or file name or hash]: assetId }: images already downloaded
}
```

The last Update's error isn't in the record (decided while planning): it belongs to this device
(another machine may have the key), so it's kept in memory and shown in the tab.

- **The snapshot is a document asset** (`doc.addAsset`): the parsed table as JSON. Assets are outside
  the undo history and never deleted, so undoing an Update points the record back at the old asset
  and the data comes back too. Opening the file never re-parses.
- **Secrets** (fields a source type marks `secret`: API keys, auth headers) are saved on the device
  (a `Storage` entry keyed by source id), never in the record. A collaborator or another machine
  without them sees "Add the key on this device to update" and still uses the saved data.

### Points (the plugin API)

```
DataSourceType {           // dataSourceTypes, plain TS
  id, label, icon
  settings: SettingSpec[]  // declarative: text, url, select, number, key-value list, file, secret
  name(settings)           // the default source name
  update(settings, secrets, ctx): Promise<RawData>   // { text | bytes, mime?, fileName? }
}
DataFormat {               // dataFormats, plain TS
  id, label, extensions, mimes
  sniff?(raw): boolean     // for format "auto"
  options?: SettingSpec[]
  parse(raw, options): Promise<unknown>   // JSON-like data: objects, arrays, values
}
```

`ctx` gives what a source may use, so plugins never touch `@platform`: `http.request({ url, method,
headers, body, timeout })`, `readFile(path)`, `pickFile(extensions)`, `signal` (cancel). The
`HttpClient` interface in `shared/core` grows `request` (today it only has `getText`/`getBytes` for
link previews). The Tauri HTTP capability already allows `http(s)://*`. An optional UI point,
`dataSourceForms`, lets a type replace the generic settings form (for an OAuth button, say).

Built-in types: **file** (a path, read again on Update; on the web build, Update asks for the file
again) and **http** (URL, method, headers, body, an optional "list at" path, simple pagination:
page/offset parameter or a "next" URL field, with a page cap). Built-in formats: **CSV**, **JSON**
and **Excel** (`.xlsx`, a sheet option; the library is loaded only when used).

### Update, the same for every source

`updateSource(doc, id)` → the type's `update` → the format's `parse` → `shape` → normalize into a
table → download images → write the new snapshot asset and the record in **one undo step** → every
bound layer and iterator refreshes in that step. Progress and cancel are shown in the tab, and
failures use `notifyError` (a failed Update changes nothing). One Update button per source, plus
"Update all".

### Fields, paths and shaping

- With no Shape step, the data's first list of objects is the rows (or the top-level list) and the
  fields are its raw paths: `attributes.title`, `images[0].url`, `specs` (a list).
- **Shape** (optional, shown as a step in the source's detail, like an n8n node you add or not):
  pick the list (`data.items`), rename (`attributes.title` → `name`), set a type, hide fields. It is
  data in the record, applied on every Update.
- Types are guessed from the values at the first Update and can be changed. Each type has formats:
  decimals, currency code, date style, prefix/suffix, true/false words; numbers and dates use the
  brochure's language (or the app's outside a brochure) through `Intl`.

### Tokens and bindings

- **Scopes.** Inside an iterator the current row has a name, `item` by default and renameable
  (`product`): `{product.name}`, `{product.specs.weight}`. Loop values start with `$`: `{$index}`
  (0-based), `{$number}` (1-based), `{$count}`, `{$group}`. Outside any iterator a token names the
  source: `{products[0].name}`, `{products.$count}`. Iterators nest, so the inner one sees the outer
  one's names. Source and row names can't be the catalog's own tokens (`page`, `pages`, `title`,
  `section`, `date`, `toc`) or start with `$`, so they never clash with page items.
- **Text templates.** A text layer can hold data tokens (inserted from a field picker while editing
  the text, or typed). It keeps its template in its own field, as page items do with `catalogText`,
  and its styled runs survive: a token takes the style of the run it sits in
  (`Price: **{product.price}**` stays bold).
- **Field bindings** from a **Data** section of the properties panel, over the kinds' bindable fields
  (the ones variables use) plus the image fill: an image fill ← an image field (keeping its scale mode
  and placement, as Replace does), a fill or stroke color ← a color field, opacity and size numbers ←
  number fields, visibility ← a condition. Binding a field to data removes its variable binding
  (decided while planning, so the two never fight over the field).
- **Conditions:** `{ path, op: exists | empty | = | ≠ | > | < | contains, value }` to show a layer
  (a "Sale" badge when `discount > 0`), and "hide when empty" on bound texts and images.
- **Preview row:** a template shows its iterator's first row; the Data section picks another row to
  design against.

### The element iterator ("Repeat")

- Set on a frame (properties panel, or `set_repeat`): `repeat: { source or path (a list in scope),
as, filter[], sort[], limit?, designLimit? }`. The frame's **first child is the template**
  (the card); it is real, editable and shows row 0. Rows 1…n−1 are **copies** made after it, locked
  and tagged (`dataCopy { iterator, row, key }`), and laid out by the frame's auto layout (Repeat
  offers to add a wrapping one when the frame has none).
- A diff-based sync (an `afterEdit` hook, pure `planDataCopies` + a writer, as `syncPageItems`
  does) keeps copies in step with the template and the data: only what changed is written, in the
  edit's undo step. Copies are matched by a row **key** (an `id`-like field when there is one,
  chosen in the iterator, else the position), so sorting or inserting a row moves copies instead of
  rewriting them all.
- **Hand edits = Detach**, as with master layers: a detached copy is unlocked and untagged, its key
  goes in the iterator's `detached` list, and the sync neither updates nor replaces it. If its row
  disappears, a check says so. Editing the template changes every copy that isn't detached.
- `limit` caps the rows everywhere; `designLimit` caps only the copies made while designing (the
  export makes all of them, below).

### Repeating sections and pages (Catalog)

Revised 2026-11-05 with the user: what repeats in a brochure is a **group of pages**, not one
page. A product can have a cover, a description and 0…n gallery pages; anything with rows works the
same (hotels, menu items, people). It reads like code: a repeating section is a `for` loop and its
pages are the loop body; the layers inside read the loop variables of every loop around them.

- **A section repeats** (`BrochureSection.repeat`): "Repeat for each row" on a section (select pages
  → Make section → Repeat). Settings as the element iterator's: `source` (a list in scope: a source,
  or `category.products` inside an outer repeat), `as`, `key`, `filter[]`, `sort[]`, `limit?`,
  `designLimit?` (copies of the section made while designing, default 3), `previewRow?`,
  `detached[]`. Each row gets a copy of every page of the section, nested subsections included.
  The section's name may hold tokens (`{product.name}`), so each copy is a real section with its
  own name in the page list, `{section}` and the table of contents.
- **A page repeats** (`BrochureSlot.repeat`): "Repeat this page" over a list in scope, with
  `perPage` rows on each copy (default 1). With `perPage: 1`, `as` is the row; above 1, `as` is the
  page's list of rows (an array a card repeater inside iterates). An empty list makes **no page**
  (the template page itself is left out of the print), which is how "n+ pages or none" works.
- **Groups are nested sections:** "a section per category with an opener page" is a repeating
  section over categories whose first page is the opener, holding a repeating subsection over
  `category.products`. There is no separate `groupBy`/opener setting.
- **Templates are the first copy:** the pages you designed show the preview row (step it ◀ ▶ to test
  other rows, e.g. one with no photos); a few real copies follow, locked and tagged; the rest are
  **pending** pages, counted but not made ("+36 pages at export"). Edits to the template flow to every
  copy; Detach frees a copy, as with cards.
- **Scope flows down:** a layer reads the rows of every loop around it: card repeaters (phase 3),
  page repeat, section repeats, out to the sources. The data module offers a point for extra rows
  around a layer; catalog answers it for pages, so bindings work the same in Design mode and the
  Catalog mode. The Data section shows **In scope**: each name, where it comes from and its row
  (◀ 3 of 40 ▶). Template page frames carry a tag on the canvas ("Product · row 1 of 40").
- Master copies are stamped on generated pages by the existing page-items sync; the template's own
  master copies are never copied.
- **Counting what isn't on the canvas:** pending copies are planned (rows, nested repeats, chunks)
  without being made, so "Page 3 of 240", printed numbers and `{toc}` are right while designing.

### Export

- When a brochure uses sources, Export asks: **Update the data first** or **Use the saved data
  (updated 3 days ago)**. Agents' `export_brochure_pdf` takes `updateSources: boolean`.
- With designLimits in play, the export runs on a **scratch copy** of the document (the Yjs state
  cloned into a throwaway `CanvasDocument` and workspace): it makes every page there and exports from
  it, so the file never gains or loses hundreds of pages behind the user's back.

### The Data tab

A left tab of the Design editor, also shown in the Catalog mode (where section and page repeats pick from
it). Lists sources (name, type icon, rows, "updated 3 days ago", error state, Update), with **+ Add
source** (pick a type, then its form). A source's detail: its settings, the optional Shape step, the
fields (path, name, type, format, a sample value) and the rows in a virtualized table. Kit
components only; semantic tokens; no new pickers where one exists.

### Checks

Added to the brochure's checks (catalog) and shown on the source: a token or binding naming a field
that isn't there; images that failed to download; bound text overflowing its box; a detached copy
whose row is gone; a source with an error or never updated; a generated set larger than a sane cap
(warn above 1,000 pages).

### Agent tools

`data` module: `list_data_sources`, `get_data_source` (fields, types, a few sample rows),
`add_data_source`, `update_data_source`, `set_data_source` (settings, format, shape, field names,
types and formats), `remove_data_source`, `bind_data` (text templates, field bindings, conditions),
`set_repeat` / `remove_repeat`, `detach_data_copy`. `catalog`: `set_brochure_repeat` / `remove_brochure_repeat` (a section or a page), and
`updateSources` on `export_brochure_pdf`. Secrets an agent passes go to the device store too.

## Phases (one plan each, each shippable)

1. **Sources:** the module, record, points, file + HTTP types, CSV + JSON, snapshot asset, secrets,
   Update, the Data tab with fields and the table, agent tools for sources.
2. **Bindings:** text tokens, field bindings, formats, conditions, images (URL, base64, file name)
   into assets, the Data section, `bind_data`. (The preview row moved to phase 3, where templates
   first have rows.)
3. **Element iterator:** Repeat, keys, filter/sort/limit/designLimit, Detach, checks.
4. **Repeating sections and pages:** section and page repeats, nested scopes and the In scope view,
   counted pending pages, export on a scratch copy, the export prompt, catalog agent tools.
5. **Finish:** Excel, the Shape step, pagination for APIs, the remaining checks, an example plugin
   (`examples/plugins/`) that registers a source type to prove the API, docs/plugins.md.

## Left to the builder

- The Excel library (lazy-loaded; check its license) and the virtualized table.
- The token parser, how templates and runs are stored, and the exact tag shapes.
- How the sync batches work so hundreds of copies don't freeze the editor (incremental, per
  iterator; idle-time for large sets if needed).
- The scratch-copy export's plumbing.
- Exact UI layout inside the kit's patterns.

## Calls made in the design (not discussed)

- Hand-edited copies stay locked; Detach frees one and Update leaves it alone.
- The template is a real layer showing the first row; copies are rows 2 onward.
- Copies are matched by a key field so reordering data doesn't rewrite everything.
- `item` as the default row name; `$` for loop values; source names can't clash with catalog tokens.
- The data module is core tier, since it owns plugin points and fields other modules read.
- Pages take a fixed number of rows (no measured flowing).
- Export with design limits runs on a scratch copy of the document.
