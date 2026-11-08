# Projects page

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); the model is in
[shared/core/projects/](../../shared/core/projects/README.md)._

- **`/projects` (`projects-page.tsx`):** reached from Home's Projects button or New project tile (`?new` opens the dialog). Search, `OpenProjectMenu` (a `.cproject` file or a project folder, `use-open-project.ts`), New project, then the **Pinned** and **All projects** grids (`ProjectGrid`, `ProjectCard`). Projects come from `useProjectsStore` (`@shared/stores/projects-store`), refreshed on focus.
- **Card:** the project's mark (`ProjectIcon`, in `@pages/shared/projects`: initials on its color; it shows a picture when given `image`, as the project home and the New project dialog do), name, file count (boards and designs, counted lazily by `useProjectFileCount`) and when it was last opened. Pin and a ⋯ menu (Remove from list; the folder stays on disk) show on hover. A missing project (its folder no longer holds the `.cproject`) is dashed with Locate… and Remove from list.
- **New project (`NewProjectDialog`, `use-new-project-form.ts`):** name (reserved names are refused, an existing folder is flagged, and the final folder is shown), color (`ColorPopover`) and an optional icon image (`pickImageFiles`), location (default `<documents>/Cloudy Canvas` from `defaultProjectsFolder()`, `pickFolder` to change it) and where the styles start from. Only "Nothing (empty)" works until the libraries exist; the other two are listed disabled.
- **Project images (`writeProjectImage`, `useProjectImage` in [shared/projects](../shared/projects/README.md)):** a picked icon or cover is copied to `.cloudy/icon.<ext>` / `.cloudy/cover.<ext>` (`writeProjectImage`) and the manifest keeps its file name; `useProjectImage(root, file, rev)` reads it back as a URL.
- **`createProject` (`create-project.ts`):** creates `<parent>/<name>/`, the hidden `.cloudy/` and the `<name>.cproject` (no libraries yet), then `useProjectsStore.open(root)` records it as opened.
- Projects exist on the desktop only: `projectsSupported()` (`@platform`) is false on Android and in the browser, where the routes redirect Home and the entry points aren't shown.

Its strings are `t` from `projects.i18n.ts` (`locales/`).
