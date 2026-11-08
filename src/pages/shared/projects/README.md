# Shared project pieces

_Used by the Projects page and the project home. Import them from `@pages/shared/projects`, never from another page's folder._

- **`ProjectIcon`:** a project's mark, its picture or its initials (`projectInitials`) on its color (`PROJECT_COLORS`, `randomProjectColor` pick a new project's color).
- **Images:** `writeProjectImage(root, "icon" | "cover", image)` copies a picked image to `.cloudy/<kind>.<ext>` and returns the file name the manifest keeps; `useProjectImage(root, file, rev)` reads it back as a URL and `useImageUrl` makes one from bytes.
- **`useProjectFileCount(root, enabled)`:** how many boards and designs a project holds.
