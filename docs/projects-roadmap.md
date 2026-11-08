# Projects roadmap

What Projects and libraries (see [the design](superpowers/specs/2026-11-08-projects-design.md)) left for later, and the limits of what shipped. The code is described in [src/shared/core/projects/](../src/shared/core/projects/README.md), [src/canvas/libraries/](../src/canvas/libraries/README.md) and [src/canvas-ui/libraries/](../src/canvas-ui/libraries/README.md).

## Left for later

- [ ] **MCP tools for libraries.** Agents can read and edit a file's variables, and editing a library-backed variable already syncs like any other edit, but there are no tools to list or edit a project's libraries, their images or SVGs. Add them as `.mcp.ts` files next to the library code, each editing tool in one `asUndoStep`.
- [ ] **Live projects.** Sharing a whole project (browse and open any file in a session) is parked in [live-projects-roadmap.md](live-projects-roadmap.md). Single-file sessions work; a guest gets the file's copy of the library items and can't edit them.
- [ ] **Rename the board's "Library" panel.** The board's Shift+I panel (widgets and templates) shares its name with the project libraries. Something like "Insert" or "Templates & widgets" avoids the clash.
- [ ] **A library shared between projects, or from a URL.** Files get styles from sources behind one contract, so these are new sources, not a rewrite. Each library is a `.clib` in the project's `.cloudy/libraries/` for now.
- [ ] **Components in libraries.** The library page and the Content section show a "No components yet" placeholder; the `.clib` format has no components.
- [ ] **Android and the web build.** Projects need a folder on disk, so the Projects button and pages are hidden there. Their storage works differently; `ProjectFs` is the seam to implement.
- [ ] **Watching the folder.** A project's files are rescanned when it opens; changes made outside the app show after a reopen.
- [ ] **Per-product variants of a library item.** The same asset shown differently on a board and in a design.

## Known limits

- A `.cproject` is trusted: a library entry's `file` or cover `file` isn't checked for separators or `..`, so a hostile file could point outside `.cloudy`.
- Every file operation re-measures the whole project and re-lists its trash; very large projects may lag.
- `ProjectFs` has no delete, so replacing a project's icon or cover with a different extension leaves the old file in `.cloudy`.
- A picture deleted from a design stays in the file's bytes (no cleanup), so undo can still show it.
- Renaming a library moves its files in steps; an asset added in that sub-second window lands in the old `.assets` folder, and a quit mid-move leaves an orphan file (no content is lost).
- Last write wins per item: undoing a library switch in one file can overwrite another file's newer edit of the same item.
- A library's current mode (Light/Dark) is per file view state and isn't sent to the library.
- While a project is missing or a library unreadable, edits to library items are reverted or stay file-only, and a toast says so once per session.
- Moving a variable to a library moves its whole collection; a collection never mixes sources.
- Copying a library doesn't remap asset ids inside its records, and renaming one doesn't update the name inside the `.clib` (the manifest's wins).
- `createProject` writes the first library twice and leaves a half-made folder if creation fails midway; `rename` and `duplicate` don't refuse `.cloudy` paths; `toTrash` renames before writing the trash index.
- Adding a file to a project keeps library records already written if the file write then fails (a retry is idempotent) and deletes the original once the copy is written.
- On Windows, `set_hidden` (the `.cloudy` hidden attribute) uses `attrib +h` and has not been run on a real machine.
- `library-hub.ts` is past the ~200 line guideline.
