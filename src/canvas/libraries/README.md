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
  tagged records gone, moved to another library or untagged (the record is still there but the
  file's own now: undoing a move to a library) are `removed` from the library they had. The sync
  applies them only to libraries the file still uses, so a library the file stopped using is never
  written; other files bake removed records out when they mirror.
- **`revertLibraryEdits(doc, ids, previous)`:** puts library records back as they were before the
  change, untracked (records it added are removed); for a file whose project is missing.

## Moving and detaching

- **`planLibraryMove(doc, ids, libraryId)`:** what moving the file's own variables, collections or
  styles to a library moves (`LibraryMovePlan`): a variable or a collection moves the whole
  collection (its variables, generators and scales, `variables` counts them) with the file's own
  axes they vary by, a style moves alone; records already in a library are left out. `blockers`
  are what they read that would stay behind (aliases, expressions, style bindings and generator
  bases on the file's own variables or another library's, or another library's axis): the library
  would point at a file, so the move is refused while there are any.
- **`moveToLibrary(doc, ids, libraryId)`:** tags the plan's records with the library's id, one undo
  step, and returns them tagged (it throws when there are blockers). It's an ordinary edit of the
  file: the editor's library sync (`observeTokens` → `libraryEditsOf`) writes the records to the
  library, as long as the file uses it. Undoing it untags them, which removes them from the
  library again (other files bake them out); redoing puts them back.
- **`detachLibrary(doc, libraryId)`:** takes a library's records out of the file through
  `bakeRemoved` (the layers keep what they showed, unlinked). Call it after the file's link stops
  listing the library, in the same undo step (`doc.setProjectLink(link, { undoable: true })` inside
  `holdCheckpoints`, as the design's libraries menu does): the sync then doesn't take the removal as
  an edit to the library, and undoing brings the link back with the records, which the next mirror
  settles. The records undo brings back are written to the library as the file had them (the
  library may have changed meanwhile; the file's copy wins).
- **`libraryUsers(doc, libraryId)`:** the layers bound to the library's variables and styles (the
  count a file shows before it stops using a library).
