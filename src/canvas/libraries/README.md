# Libraries (engine)

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); the project model is in
[shared/core/projects/](../../shared/core/projects/README.md)._

A **library** is a project's shared styles and assets, one `.clib` file in `.cloudy/libraries/`. Plain
TypeScript, so the web build can reuse it.

- **`LibraryDocument`** (`library-document.ts`): a Yjs doc with `"tokens"` (the same `TokenRecord`s as a canvas file, by id), `"assets"` (`LibraryAsset` metadata by id) and `"meta"` (id and name). `create(id, name)`, `fromFile(bytes)`, `encodeFile()`, `tokenRecords()` / `setTokenRecords` / `removeTokenRecords`, `assets()` / `putAsset` / `removeAsset`, `observe(listener)` (a `LibraryChange`: the token and asset ids that changed, local or remote) and `ydoc` for live projects later. A library has no undo history.
- **Records have no `libraryId`:** the library stores them untagged (`setTokenRecords` strips one it is given); the tag is added only when the records are mirrored into a file's own tokens.
- **Asset bytes aren't in the document:** they're `.cloudy/libraries/<file>.assets/<id>.<ext>`; `LibraryAsset.hash` (`contentHash`, SHA-256 hex) finds the same picture again, `type` is `image`, `svg` or `icon`, and `kind` (`assetKindOf`: `any` for all three today) says which products can use it.
- **File (`library-file.ts`):** `CLIB` magic, the format version and the Yjs update, through `encodeCanvasFile`/`decodeCanvasFile`.
- **`createLibraryFile(fs, root, name)`:** writes an empty `.clib` and its `.assets/` folder through the `ProjectFs` it is given (never `@platform`), with a file name free in the project (`uniqueName`), and returns the `LibraryEntry` (`autoAdd: true`) for the caller to put in the manifest.

## Sync with files

A file in a project keeps a copy of the libraries it uses in its own `"tokens"` and `"assets"`
maps, with the libraries' ids; layers bind to those records as to any. The editor side (opening
the libraries, saving them, when to sync) is in [canvas-ui/libraries/](../../canvas-ui/libraries/README.md).

- **Tags (`library-tags.ts`):** `libraryIdOf(value)` reads a stored record's library, `taggedRecord`
  adds the tag a file stores, `untaggedRecord` drops it for the library. Every token record kind
  takes the tag (axes, collections, variables, styles, generators, scales).
- **Which libraries (`librariesUsedBy(link, entries)`):** a link with `libraryIds: "all"` uses the
  manifest's libraries with `autoAdd`; a list uses those of them the project still has.
- **`mirrorLibraries(doc, libraries, readBytes, { keep, usedAssets })`:** makes the file match the
  libraries: each library record is stored tagged (the library wins), tagged records that are no
  longer in a used library (deleted there, or the file stopped using it, or the project deleted the
  library) leave the file through `bakeRemoved`, records of the libraries in `keep` (used but
  unreadable now) stay, and the bytes of library assets in `usedAssets` the file lacks are copied in
  under the same ids (`readBytes` returns `null` for one it can't read). It writes nothing when
  everything matches.
- **`bakeRemoved(doc, ids)`:** removes records as deleting them does (`deletionRewrites`,
  `detachEverywhere`): layers keep what a variable or style gave them, unlinked; a collection's
  variables, generators and scales go with it; variables varying by a removed axis keep their
  defaults.
- **Untracked (`writeUntracked(doc, fn)`):** the mirror, `bakeRemoved` through it, and reverts write
  inside `doc.runAs({ origin: UI_ORIGIN })` with the ordinary setters, so no undo history records
  them while the after-edit hook (the token sync) still updates the bound layers.
  `observeTokens` reports these writes as not `local`.
- **`libraryEditsOf(ids, previous, doc)`:** from an `observeTokens` change (ids and their earlier
  values), the library records the user wrote, by library: tagged records now are `put` untagged,
  tagged records gone (or moved to another library) are `removed`. A record that lost its tag stays
  in its library.
- **`revertLibraryEdits(doc, ids, previous)`:** puts library records back as they were before the
  change, untracked (records it added are removed); for a file whose project is missing.
