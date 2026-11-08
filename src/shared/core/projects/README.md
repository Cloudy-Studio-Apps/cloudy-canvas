# Projects (`shared/core/projects/`)

Plain TypeScript model of a **project**: a normal folder on disk that holds boards and designs
(any depth of subfolders), shared libraries and a trash. No React, no platform code; disk and
registry access are the `ProjectFs` and `ProjectRegistry` interfaces, implemented in `platform/`.

## On disk

```
<root>/
  <Project name>.cproject      the manifest (JSON)
  .cloudy/                     reserved: never listed as content
    libraries/<name>.clib      a library
    libraries/<name>.assets/   its images and SVGs, <id>.<ext>
    trash/                     deleted items, plus index.json
  Posts/Logo.cboard            the user's files and folders
```

`projectPaths(root)` builds those paths in the style of `root` (`/` or `\`). `relativeTo` and
`joinRelative` convert between absolute paths and `/`-separated paths relative to the root;
`isProjectFilePath` tells a `.cproject` path and `parentFolder` gives the folder holding a path.

## Manifest (`project-manifest.ts`)

`format` (1), `id`, `name`, `color`, `icon` (or null), `cover` (`{kind: "colors"}`,
`{kind: "image", file}` or null), `libraries` (`id`, `name`, `file`, `order` fractional index,
`autoAdd` default true), `folders` (folder path to `{color?}`) and, optionally, `copiedFrom` (the
id a copied project folder had before it was made its own project). `parseManifest` validates every
field, drops unknown ones and defaults `cover` to null and `folders` to `{}`.

## Sizes

`formatSize(bytes)` writes a byte count for people ("48 MB") in the app's language. `measureProject(fs, root)` splits a project's size into `files` (outside `.cloudy`), `libraries` (`.cloudy/libraries/`), `trash` (`.cloudy/trash/`), their `total` and the trash's item count.

## Trash index (`trash-index.ts`)

`.cloudy/trash/index.json` is an array of `TrashEntry` (`id`, `name`, `from` relative path,
`deletedAt`, `size`, `folder`). Files keep their place in the trash by `id`.

## Names (`project-names.ts`)

`isReservedName` rejects `.cloudy`, characters and names Windows forbids and empty names.
`uniqueName("Logo.svg", taken)` gives `Logo 2.svg` (case-insensitive).

## Files

A file saved inside a project carries `FileMeta.projectId`, so it can find its project again.

## Registry (`ProjectRegistry`)

The projects this device knows are `ProjectRecord`s (`id`, `name`, `root`, `color`, `pinned`, `openedAt`) in `<appData>/projects.json`, implemented in `platform/tauri-project-registry.ts` (exported as `projectRegistry`). Records are validated on read (`isProjectRecord`), writes are atomic and queued, and an unreadable file is set aside as `projects.corrupt.json`. `useProjectsStore` (`shared/stores`) is the UI side. A file's index entry keeps `projectId` when saved with it.

## Disk access (`ProjectFs`)

Implemented in `platform/tauri-project-fs.ts` (exported as `projectFs` from `@platform`) with the
Tauri fs plugin. `scan` lists one level and skips dotfiles and the `.cproject`. `move`, `rename`,
`duplicate` and `restore` never overwrite: they pick a free name with `uniqueName`. `toTrash` moves
an item to `.cloudy/trash/<entry id>/<name>`, records it in `index.json` and refuses anything inside
`.cloudy` except a library's `.clib` file and `.assets` folder (`.cloudy/libraries/<item>`), which deleting a library moves there. Text and bytes are written atomically (`platform/write-atomic.ts`: a `.tmp` file renamed
over the target, writes to one path queued). `makeHidden` calls the `set_hidden` command (Windows
hidden attribute; no-op elsewhere). `readManifest(root, id?)` reads the project in a folder (the one with `id` when given);
`readManifestFile(root, id?)` also says which `.cproject` it read (`ManifestFile`: `file` name and
`path`), which isn't always `<manifest name>.cproject` (a file renamed outside the app): the
project home writes the manifest back to that file and renaming the project renames it.
`findManifestAbove(file, id)` walks up from a file to the top of its drive or share, skipping
unreadable manifests, and returns the nearest one whose `id` is `id` or whose `copiedFrom` is
(`FoundManifest`, with its `root`). `samePath` and `isPathInside` compare absolute paths of either
separator style, ignoring case for Windows-style ones (`relativeTo` uses the same rule). `removeFile(path)` deletes a file for good (never a folder): only the original of a file
added to a project, once its copy in the project is written.
