# Shared file pieces

_Used by more than one page (Home and the project home). Import them from `@pages/shared/files`, never from another page's folder._

- **Previews and icons:** `FilePreview` (a file's thumbnail on its kind's tint, or its icon; `useFileThumbnail` loads the picture), `FileKindIcon`.
- **Kinds (`file-kind.ts`):** `HomeFileKind` is a file's type, or `catalog` for a design left in Catalog mode (`fileKindOf` / `useFileKindOf`); `KIND_LABEL`, `KIND_TINT`, `CATALOG_STYLE`.
- **Menus:** `FileAction` (id, label, icon, run, destructive) drawn by `FileActionsMenu` (the ⋯ button) and `FileContextMenu` (right-click).

Its strings are `t` from `files.i18n.ts` (`locales/`).
