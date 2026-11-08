# Add to project

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md); the merge itself is in
[canvas/libraries/](../../../canvas/libraries/README.md#adding-a-file-to-a-project-merge)._

Moves a loose board or design into a project: into one of its folders, its styles and pictures into
one of its libraries, linked to the project (`{ projectId, libraryIds: "all" }`). Used by Home (a
file's Add to project…) and the project home (New ▾ › Add existing file…). Import it from
`@pages/shared/add-to-project`.

- **`AddToProjectProvider`** (`project?` fixed, `folder?` offered first, `onAdded`) and
  `useAddToProject()`, which opens the dialog for a file (`null` outside a provider). The dialog is
  loaded the first time it opens, so Home stays light. `chooseExistingFile()` asks for a file and
  records it in the recent files, refusing one already in a project.
- **The dialog** (`AddToProjectDialog`, `useAddToProjectForm`): the projects this device knows that
  aren't missing (New project… goes to the Projects page's dialog), the folder (every folder of the
  project, `useProjectFolders`; a file already in the project's folder starts in its own), the
  library its styles go to (only among those every file uses, `autoAdd`, since the `"all"` link
  takes only those; the first by default, a choice when there are several), then `StylesSummary`:
  how many variables and styles are new, how many pictures go too, and each clash as a `ClashRow`
  (both colors for a color variable) with Use project's / Keep both.
- **`MergeSession`** (`merge-session.ts`, loaded on demand by `useMergeSession`): the file opened
  without an editor (the app has one editor at a time and this runs from Home or the project home,
  so the file isn't open) with its product's codec (`FILE_CODECS`: open with the modules'
  migrations, the product's after-edit hook while merging, the editor's encoder, the design's
  picture relink), and the project's `LibraryHub`. `plan(libraryId)` is `planLibraryMerge`;
  `commit` first loads the fonts the file uses and those it will use once merged
  (`loadMergeFonts`: `previewLibraryMerge` on a fork, then `documentFonts` and `loadDocumentFonts`
  with `fontLibrary`, as an editor opening the file does; one that can't be loaded falls back as in
  the editor), since the product's after-edit hook measures and lays out text again during the
  merge. Then it moves the file's pictures with `moveAssetToLibrary`, applies the merge, waits for the
  library's save (`hub.flush`), sets the link, then writes the file: in place when it's in the chosen
  folder already, else as a new file there (`targetPath`: its name made free; a draft is named after
  its title) through `storage.save`, which points the recent file at it (same id, with the project
  id) and drops a draft's own file. Only then is the original deleted (`projectFs.removeFile`); if
  that fails a toast says where it still is. Anything failing before the copy is written leaves the
  original untouched. `close` waits for a running commit.

Its strings are `t` from `add-to-project.i18n.ts` (`locales/`).
