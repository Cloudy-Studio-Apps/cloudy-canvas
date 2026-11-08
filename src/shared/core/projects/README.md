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
`joinRelative` convert between absolute paths and `/`-separated paths relative to the root.

## Manifest (`project-manifest.ts`)

`format` (1), `id`, `name`, `color`, `icon` (or null), `cover` (`{kind: "colors"}`,
`{kind: "image", file}` or null), `libraries` (`id`, `name`, `file`, `order` fractional index,
`autoAdd` default true) and `folders` (folder path to `{color?}`). `parseManifest` validates every
field, drops unknown ones and defaults `cover` to null and `folders` to `{}`.

## Trash index (`trash-index.ts`)

`.cloudy/trash/index.json` is an array of `TrashEntry` (`id`, `name`, `from` relative path,
`deletedAt`, `size`, `folder`). Files keep their place in the trash by `id`.

## Names (`project-names.ts`)

`isReservedName` rejects `.cloudy`, characters and names Windows forbids and empty names.
`uniqueName("Logo.svg", taken)` gives `Logo 2.svg` (case-insensitive).

## Files

A file saved inside a project carries `FileMeta.projectId`, so it can find its project again.

## Disk access (`ProjectFs`)

Implemented in `platform/tauri-project-fs.ts` (exported as `projectFs` from `@platform`) with the
Tauri fs plugin. `scan` lists one level and skips dotfiles and the `.cproject`. `move`, `rename`,
`duplicate` and `restore` never overwrite: they pick a free name with `uniqueName`. `toTrash` moves
an item to `.cloudy/trash/<entry id>/<name>`, records it in `index.json` and refuses anything inside
`.cloudy`. Text and bytes are written atomically (`platform/write-atomic.ts`: a `.tmp` file renamed
over the target, writes to one path queued). `makeHidden` calls the `set_hidden` command (Windows
hidden attribute; no-op elsewhere). `findManifestAbove` walks up from a file, skipping unreadable
manifests.
