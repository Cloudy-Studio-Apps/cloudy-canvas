# Shared file pieces

_Used by more than one page (Home and the project home). Import them from `@pages/shared/files`, never from another page's folder._

- **Previews and icons:** `FilePreview` (a file's thumbnail on its kind's tint, or its icon; `useFileThumbnail` loads the picture), `FileKindIcon`.
- **Kinds (`file-kind.ts`):** `HomeFileKind` is a file's type, or `catalog` for a design left in Catalog mode (`fileKindOf` / `useFileKindOf`); `KIND_LABEL`, `KIND_TINT`, `CATALOG_STYLE`.
- **Where a file is in its project:** `folderOfFile(root, path)` (the folder relative to the project, `""` for its root, `null` outside it), `projectLabel(file, projects)` ("Project › Posts / 2026", the project's name for one in its root or outside its folder, `null` for no known project), `useProjectLabel(file)` (from `useProjectsStore`) and `ProjectPlace` (the label with a briefcase; nothing for a loose file). Kept here, not in `shared/projects`, so Home doesn't load the projects' heavier pieces.
- **Menus:** `FileAction` (id, label, icon, run, destructive) drawn by `FileActionsMenu` (the ⋯ button) and `FileContextMenu` (right-click).

Its strings are `t` from `files.i18n.ts` (`locales/`).
