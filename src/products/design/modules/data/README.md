# Data

Sources of data for a design: a file, a link or a sheet whose rows later fill the design's layers. This folder holds the source record; bindings and iterators build on it.

- **Tier:** core
- **Requires:** core, pages, frame; uses: text, image, auto-layout
- **Contributes:** kinds `DataSourceKind`
- **Points it owns:** none yet (`dataSourceTypes` and `dataFormats` come with the sources)
- **MCP tools:** none yet
- **Files:** `source/` (the `data-source` record: types, defaults, factory, kind), `data.i18n.ts` with `locales/`, `ui/`.

## How it works

- **The record** (`source/`): a `data-source` element (`DataSourceKind`) is a record, not a layer: never drawn or hit, `creatable = false`, `boxed = false`. It has a `name`, a `sourceType` (where the data comes from) with its `settings`, a `format` (`"auto"` or a format id) with `formatOptions`, the `fields` found in the data (`DataField`: `path`, `alias`, `type`, `format`, `hidden`), the last copy `snapshot` (`DataSnapshot`: an asset id, `updatedAt`, `rowCount`, `hash`; `null` until the data is fetched) and `images`, assets the data names. `assets(el)` lists the snapshot's asset and every image, so they stay in the file and copy with it; `fillDefaults` fills every field for older records.
- **No errors on the record**: a failed fetch is device-local and is kept in memory by a service, never written to the file.
- `createDataSource(index, { name, sourceType, settings, format? })` makes one; `isDataSource(el)` narrows.
