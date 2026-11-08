# Projects and libraries

_Design, 2026-11-08. Mockups: [`docs/prototype/projects-home-v3.html`](../../prototype/projects-home-v3.html) (Home, Projects, project home, Settings; v1 and v2 next to it are earlier rounds) and [`docs/prototype/projects-assets.html`](../../prototype/projects-assets.html) (a design using a project's libraries)._

## Why

Today Home has one list, Recent files, ordered by time. Someone working for several clients loses a client's files under the others after a few days. Every new design starts empty, so the brand (colors, text styles, logo) is rebuilt in each file, or everything is crammed into one design with a page per post. Real case: Cortijo Hierbabuena has a board of monthly post ideas and one design holding the brand manual and every post, which keeps growing.

A **project** groups a client's or a brand's files in a real folder, and holds **libraries**: the brand's colors, text styles, images, SVGs and icons, which every file in the project uses and keeps in sync.

## Goals

- Projects: a folder on disk with a `.cproject` file, listed in the app, with a project home to browse and organize files in folders.
- Libraries: per project, several of them, each holding styles and assets; files use them and stay in sync both ways, boards included (colors only).
- Moving existing files into a project, with their styles merged into the project.
- A trash per project, and storage information in Settings.

## Non-goals (this version)

- Components (the library and its UI leave room for them: a "No components yet" placeholder).
- A library used by several projects, or a library from a URL / public library. The design keeps sources pluggable so these are new sources later, not a rewrite.
- Live sessions of a whole project: parked in [`docs/live-projects-roadmap.md`](../../live-projects-roadmap.md). Single-file sessions keep working (see Live sessions).
- Shared assets on boards: boards read the libraries' **colors** only.
- Projects on Android and in the web build: desktop only. Their storage works differently; the interfaces must not make them impossible.
- Watching the folder live for outside changes (rescan on open is enough for now).
- A variant of one library item per product (the same asset shown differently on a board and in a design).

## Anti-goals

- A file that looks wrong because its project is missing. A file always opens looking as it did.
- The app and the disk disagreeing about folders. The folder on disk is the truth.
- Losing work: deleting goes to the trash, writes to project files are safe against crashes.

## Concepts and data

### Project folder

```
Cortijo Hierbabuena/                ← the project folder (any location)
  Cortijo Hierbabuena.cproject      ← marks the folder as a project (visible: double-click opens it)
  .cloudy/                          ← everything the app owns, hidden
    libraries/
      Brand system.clib
      Brand system.assets/          ← the library's images and SVGs, by id
      Social kit.clib
    trash/                          ← deleted files and folders, kept until emptied
  Brand/
    Brand manual.cdesign
  Posts/
    2026/
      Posts · November.cdesign
  Planning/
    December ideas.cboard
```

- **`.cloudy/`** is the one reserved name in a project folder: the app's data (libraries, their assets, the trash, and anything it adds later such as caches) lives there, out of the user's folders. The project home never shows it, and the app refuses to let the user create a folder with that name. A leading dot hides it on Linux and macOS; on Windows the app sets the folder's hidden attribute when it creates it. Copying or zipping the project folder takes it along.

- **Default location:** new projects go in a default folder (proposed `~/Documents/Cloudy Canvas/`), changeable in Settings and per project when it's created.
- **`.cproject`** holds what the disk can't: `id` (`createId()`), name, icon and color, cover, the library list (ids and file names, order), and per-folder presentation data the user sets (folder colors, pinned/sort). It does **not** list the files: the folder is the truth and is scanned on open.
- **Folders in the app are real folders.** New folder creates one on disk; dragging a file onto a folder moves it on disk; rename renames on disk.
- The libraries' extension (`.clib`) is the builder's call; a library being its own file in `.cloudy/libraries/` is the design's (it maps one-to-one onto a style source and can later live elsewhere, e.g. a URL).

### Library

A library (`.clib`, one per library) holds, in the same record formats files use today:

- **Styles:** variables (collections, mode axes, variables) and styles (`canvas/tokens/`).
- **Assets:** images, SVGs and icons, each with a name, a group path (`Brand/Logo`, `Posts/Backgrounds`, the slash paths variables already use) and a **kind** saying which products can use it (`any` for images, SVGs and icons; components later take the product they're made in). The kind is stored per item, worked out from its type; groups are only for organizing and may mix kinds. A product only shows the items it can use and hides groups left empty.
- Later: components, as another asset type in the same groups.

### Style sources

Files get styles and assets from **sources** behind one contract (a registry, like the app's other registries): list, read, write (when writable), and notify on change. This version has two: **this file** (local) and **project library** (one per library the file uses). A URL library or a library shared between projects is a new source later, with nothing else changing. Pickers and the Assets tab group by source.

### Files in a project

- A `.cboard` / `.cdesign` stores the **`projectId`** of its project and the **ids of the libraries it uses** (default: all of the project's libraries; a file can turn libraries on and off).
- The app keeps a **registry of projects** (id → folder), next to the recent files. Opening a file asks the registry where its project is.
- **Fallback before warning:** if the registry's path is wrong, the app looks for a `.cproject` with that id in the file's folder and the folders above it (the usual case: the whole project folder was moved). If found, the registry is fixed silently.
- **Project not found:** a dialog says the file belongs to a project that isn't where it used to be: **Locate project…** or **Continue without the project**. The file still looks right (see the copy below); until the project is found, library items can't be edited and changes from other files don't arrive.
- **Each file keeps a copy** of the library styles and assets it uses. It's what makes a file look right without its project, when sent alone to someone, and in a live session. It's a backup, not a second source of truth: when the project is present, the library wins.

### Sync

- **Automatic, both ways.** Editing a library style or asset from any file writes it to the library file right away. Other open files using that library update immediately; closed files catch up the next time they open. No review step.
- Consequence (accepted): changing the brand green changes old published posts the next time they're opened.
- **Undo:** undoing a library edit in the file that made it reverts it in the library too (and so everywhere).
- **Simultaneous edits** of the same item from two open files: last write wins, both end up showing the same value.
- **Boards** read the libraries' colors through the variables they already bind to (`products/board/modules/colors`); editing a library color from a board syncs like from a design. Text styles, effects and assets aren't shown on boards in this version.
- **Safe writes:** `.cproject` and `.clib` are written to a temporary file and swapped in, so a crash mid-save can't corrupt them.
- In memory, a library is held like a document (the project's styles kept in a Yjs document, written to its file on save), so live projects can later sync it like any document (see the live projects roadmap).

### New items stay in the file

Creating a color, a text style or adding an image inside a file puts it in **this file** (local). A **Move to library…** action (on a local style, variable or asset, in the pickers, the variables panel and the Assets tab) moves it into one of the project's libraries, relinking what used it.

## Screens

### Home

- Recent files stay as they are. Each card/row shows the project and folder it belongs to ("Cortijo Hierbabuena › Posts"); files outside projects say nothing (or "Not in a project").
- A **Projects** button in the top bar opens the Projects list. **New project** joins New board / New design in the create column.
- A file's context menu (and ⋯) gets **Add to project…** for files outside a project.

### Projects list

Search, **Open project…** (pick a `.cproject` or its folder), **New project**. **Pinned** projects first, then all. A card shows the project icon and color, name, file count, last edit, a preview, and its main library's swatches and fonts. A project whose folder is gone shows **Locate…** and **Remove from list**.

### Project home (`projects-home-v3.html`)

- **Header:** a cover (default: a band of the main library's colors; **Change cover**), a large project icon overlapping it, the name, a meta line (files · libraries · last edit · the folder path, which shows it on disk), **Pin**, **⋯** (rename, icon and color, show in folder, export as .zip, remove from list) and one **New ▾** (design, board, folder, library, add images to a library, add existing file).
- **Tabs:** Files · Libraries · Trash.
- **Files tab:** Recently edited (three wide cards), a path bar (Project › Posts › 2026), search, sort, grid/list; folders as tiles showing three of their files; then files. Drag a file onto a folder (in the grid or the sidebar tree) to move it. A file's context menu: Open, Rename, Move to…, Duplicate, Show in folder, Move to trash.
- **Sidebar:** **Files** (the folder tree: filled folder icons in a color the user picks, an indent guide for children, quiet counts, a New folder button); **Libraries** (All libraries, then each library with a small color strip and a count, **+** for a new library); **Content** (Colors, Text styles, Images, SVG & icons, Components, Effects: each opens that kind across every library, grouped by library; Components shows "No components yet"); **Trash** pinned at the bottom with its count and size.
- **A library's page:** its name, color strip, "Used by N files", **Edit in a file**, **Add ▾** (color, text style, images or SVG, import a file's styles), then its content by kind: Colors, Text styles, Images, SVG & icons, Components (placeholder).
- **Footer:** "12 items in trash · 48 MB", Open trash, and the project's total size.

### New project dialog

Name, icon and color, location (default folder, **Change…**), and what the first library starts from (empty, a file's styles, a tokens JSON).

### New library dialog

Name, start from (empty, a file's styles, a copy of another library, a tokens JSON), and which files get it (every file in the project, or none until a file turns it on).

### Add to project dialog

Pick the project (or **New project…**) and the folder. The file **moves** into that folder. Its styles: those new to the project are added to a library (which one: the builder's call, default the first library; or offer a choice), clashes by name are listed one per row with **Use project's** or **Keep both** (keeping both names the file's version "Brand/Olive (Landing v2)"), and the file's layers are relinked to the library's items.

### In a design (`projects-assets.html`)

- The left panel's header shows "Cortijo Hierbabuena › Posts" above the file name.
- **Assets tab** (today a placeholder): search, grid/list, filters (All, Images, SVG, Icons), **+** (add to a library or to this file only, new group). Sources in order: each library the file uses, then **This file**; inside each, collapsible groups by path. Drag an item onto the canvas to place it. A local item's menu has **Move to library…**.
- **Pickers** (color, text style): grouped by library, then This file. A note says editing a library item updates every file that uses it.
- A toast when a library item changes from elsewhere is optional (the mockup shows one).

### Settings › Projects & storage

Where new projects go (**Change…**), space used split into files, assets and trash, a table per project (size, trash items and size, **Empty trash**), and **Empty all trash**. Trash is kept until the user empties it.

## Trash

Deleting a file or a folder in a project moves it to that project's `.cloudy/trash/`, remembering where it was so **Restore** puts it back. The trash tab lists name, where it was, when it was deleted, and Restore. Nothing is deleted automatically.

## Live sessions

Sharing one file of a project works as today. The guest gets the file with its copy of the library items it uses and can't edit library items (the host's client brand stays the host's). Sharing a whole project is the parked roadmap item.

## Agents (MCP)

Later: tools to read and edit a project's libraries. Existing tools keep working on a file's variables; editing a library-backed variable through them syncs like any other edit.

## Naming

"Library" is a generic word (Sketch, Penpot and Adobe use it), so it's fine to use. The board already has a **Library** (Shift+I: widgets and templates); two things with one name confuse. Recommendation, not part of this work unless the user says so: rename the board's panel (e.g. "Insert" or "Templates & widgets").

## Platform and layering

- Folder operations (scan, create, move, rename, trash, size), the projects registry and safe writes go through `shared/core` interfaces implemented in `platform/` (rule 7), desktop first; Android and web are later and must be possible behind the same interfaces.
- The feature is modules (rule 16): engine side plain TypeScript, UI in `ui/`; library sources as a registry the products use (rule 9 style: no global state).
- Every user-facing change gets its changelog entry (en + es), all text through i18n.

## Decisions made by Claude (check these)

- The default projects folder `~/Documents/Cloudy Canvas/`.
- Each library is its own file in the project folder, not inside `.cproject`.
- (Agreed with the user) the app's data in one hidden `.cloudy/` folder: libraries and trash.
- `.cproject` doesn't list files; it stores only what the disk can't.
- Folder colors in the tree, a cover from the library colors, tabs Files · Libraries · Trash.
- A file turns libraries on and off; default all.
- In a project not found, library items are read-only until the project is located.
- Guests in a live session can't edit library items.
- Boards: colors only, this version.

## Settled after the builder check (Claude's calls)

- **The copy is the same records.** A library's variables, collections, axes and styles are mirrored into the file's `"tokens"` map **with the library's ids**, each tagged with its library id; layers bind to them as today, so binding, sync and resolution don't change. Library assets are mirrored into the file's `"assets"` map with their library ids. Editing a mirrored record is an ordinary file edit (in the file's undo stack), and the project sync writes it to the library; undo reverts the file, and the sync writes that too.
- **The library wins.** On open (and whenever a library changes) the mirrored records are replaced by the library's. Mirrored records are read-only while the project is missing, so a file can't drift from its library and nothing is lost on catch-up.
- **Last write wins per item** (a variable, a style, an asset), not per library.
- **Deleting a library item** works like deleting a variable today: every file that uses it bakes its value into the layers (each file when it next syncs or opens) and drops the binding. The usage count and the existing delete dialog warn first.
- **Turning a library off in a file** with layers using it asks first, then detaches them the same way (values baked in); its mirrored records leave the file.
- **A file belongs to the project in its `projectId`, wherever it's stored.** The registry is authoritative; the folder search is only the fallback. A file copied out of the folder (Save a copy, sent to someone) keeps its `projectId` and stays linked; Home's project label comes from `projectId`. Duplicate in the project home keeps it.
- **The app has one window and one editor at a time.** Moving, renaming or trashing happens from Home and the project home, where no editor is open. A file an agent's workspace has open follows the move (its path updated through `Storage.relocate`, which keeps the id). Every move updates the recent files and the registry.
- **Add to project** writes `projectId` and the library ids into the moved file. Clashes: same name and same type is a clash (Use project's / Keep both); same name with another type is kept as both, renamed. Mode axes match by name, and modes missing on one side are added. Text styles and effects match like variables. Assets are deduplicated by content (hash), not by name.
- **`.clib` uses the same container as `.cdesign`** (a Yjs document), so loading, saving, safe writes and later live projects reuse the document code.
- **Library images and SVGs are files beside it** (`.cloudy/libraries/Brand system.assets/<id>.<ext>`), referenced by id from the `.clib`, so adding an image doesn't rewrite the whole library and Settings can size them. A file's mirror still embeds the bytes it uses (the copy must work alone).
- **Effects** are listed if the design's effects are styles today; otherwise the Effects row is a placeholder like Components.
- **Restore** of a trashed item recreates a missing folder and adds a number to the name if one exists.

## Left to the builder

File formats and versions of `.cproject` and `.clib`; how library records are mirrored into a file and kept in step (ids, conflict handling within "last write wins"); where new styles go when a file is added to a project; the registry's storage; scanning performance on large folders; the exact module split and names; the per-item kind's stored values.
