# Project libraries in the editor

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); the engine side (mirror,
edits, baking) is in [canvas/libraries/](../../canvas/libraries/README.md)._

A file in a project uses the project's libraries: a copy of their records lives in the file, and
edits travel both ways while the project is found.

- **`LibraryHub`** (`library-hub.ts`, file access in `library-files.ts`): a project's libraries in
  memory, one per project, shared by whoever opens it. `LibraryHub.open(record)` (a module-level
  cache by project id, counted) returns an `OpenedHub`, `{ hub, release }`: each opener calls its
  `release` once (a second call does nothing), and the last one drops the hub. It reads the
  manifest and each `.clib`: `entries()` is every library of the manifest, `libraries()` and
  `library(id)` the ones that could be read, `unreadable()` the ids that couldn't (with a toast; a
  `.clib` whose own id isn't its manifest entry's counts as unreadable too: kept in files, never
  mirrored or written).
  `apply(edits, from)` writes edits per item, the later one winning (a record another loaded
  library holds is skipped with a warning, `withoutForeignRecords`: one id lives in one library), and `onChange` fires with the
  ids of the libraries that changed and `from` (`null` for changes nobody applied), so an editor
  skips its own. `refresh()` reads the manifest again (the project home after adding, removing or
  renaming a library): new libraries load, removed ones leave (their pending save dropped),
  unreadable ones are tried again, and listeners hear the ids that changed, so open files mirror
  again (a removed library's records are baked out of them, a new `autoAdd` library comes into files
  using `"all"`). `addAssetFile(libraryId, bytes, input, id?)` (a moved file picture passes its own id) stores a picture in
  `<library>.assets/<id>.<ext>` (the same bytes, by `hash`, return the asset it has already);
  `readAssetBytes` reads one back.
  - **`flush(libraryId)` and `hold(libraryId)`:** `flush` writes a library's pending edit now and waits for the saves; `hold` does that and then keeps its later edits from being written until the returned function runs, so the project home can rename the `.clib`. `relocate(libraryId, file)` points the library at its new file name in memory right after the rename, so any save from then on (the last `release`, quitting) writes to the right name; `refresh()` reads the manifest afterwards.
  - **Saving** (`library-saver.ts`): a changed library's `.clib` is written 300 ms after its last
    edit, atomically (`projectFs.writeBytesAtomic`), one write at a time; a failed write is
    toasted and stays pending (unless a newer edit replaced it), so the next edit, flush or save
    tries it again; the last `release` and
    quitting the app (`appLifecycle.onBeforeQuit`, which the window waits for) write what's
    pending, and opening the project again waits for those writes.
- **`useProjectLibraries(engine, file)`** (both products' file sessions; live guests never call it;
  where projects aren't supported, `projectsSupported()` false on Android and in the browser build,
  it stays `none`: no hub, no missing dialog, and the file's library items read-only):
  reads the project from the document's link (a new file opened with `?project=` gets
  `{ projectId, libraryIds: "all" }`, or the listed ids with `&libraries=<id>,<id>`), finds it with `useProjectsStore.resolve(id, file.path)` and
  opens its hub. When that returns another project (the file is in a copied project folder made its
  own), the file's link is pointed at the copy's id instead (the recent file follows the link) and
  the copy's hub opens. Its `ProjectLibrariesState` (`status` `none` · `loading` · `ready` · `missing`,
  `projectId`, `project`, `hub`, the `libraries` the file uses, `locate`) goes to the chrome through
  `ProjectLibrariesContext` (`useProjectLibrariesState()`; `NO_PROJECT_LIBRARIES` for live guests).
- **Sync** (`use-library-sync.ts`, while `ready`): the libraries are mirrored into the file when
  the hub opens, when a library changes (another opener's edit, or `refresh`) and when the file's
  link changes, one mirror at a time (`mirrorLibraries`; library pictures the layers show are
  copied in). Libraries the file uses that aren't loaded (unreadable) are `keep`: their records stay
  in the file as they are, never baked out. The user's
  own token writes (`observeTokens`, `source.local`: edits, agents, undo and redo) to library
  records go to the hub (`libraryEditsOf`, only for libraries the file uses), so undoing a library
  edit reverts it in the library too. A live session's guest writing a library record
  (`source.remote`, on the host) reaches nothing: the host mirrors again right after, so the
  library's value comes back for everyone.
- **Project not found** (`missing`): `ProjectMissingDialog` offers Locate project…
  (`useProjectsStore.locate`, then the hub opens from there) or Continue without the project. Until
  it's found, `useLibraryGuard` puts back every edit the user makes to a library record, untracked,
  after the edit's transaction (`revertLibraryEdits`), and a toast says why once per editor. The
  user's undo step stays in the stack, with nothing left to undo.
- **The file's libraries and Move to library (both products):** `FileLibrariesMenu` (the libraries
  button: each project library with a switch for the file, hidden in a file without a project;
  `useFileLibraries` writes the link and `detachLibrary` as one undo step, asking first when layers
  use the library) and `MoveToLibraryMenu` / `useMoveToLibrary(ids)` (right-click → Move to
  “library”… for the file's own variables, collections and styles while the libraries are `ready`;
  a confirmation says what goes with it, a move that would leave references behind is refused with a
  toast). The design's Variables and Styles sections and the board's colors panel use them.
