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
