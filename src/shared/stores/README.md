# App stores

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Toasts

- **Toasts:** report failures with `notifyError(title, error)` or `toast({...})` (`shared/stores/toast-store.ts`), never only `console.error`. The `<Toaster />` is mounted in the providers.

## Saved palettes

- **Saved palettes:** `usePaletteFavoritesStore` (`palette-favorites-store.ts`) keeps the palettes saved from the color wizard's gallery between sessions (`toggle` saves or removes one). They're the user's, not a file's.
- **Products:** `useProductsStore` (`products-store.ts`) says when both products have loaded behind the first page; see [Startup](../../app/README.md#startup). `useDesignModeStore` (`design-mode-store.ts`) keeps the mode each design was left in.
- **Home:** `useHomeStore` (`home-store.ts`, `cloudy-canvas:home`) keeps Home's choices: the seals card hidden or not, and the recent files as a grid or a list.
- **Motion:** `useMotionStore` (`motion-store.ts`, `cloudy-canvas:motion`) keeps Settings › Appearance's Play GIFs (on by default); `useCanvasEngine` applies it to every editor's engine, live. The board's HTML viewer doesn't read it.
- **Language:** `useLocaleStore` (`locale-store.ts`, `cloudy-canvas:locale`) keeps Settings › Language (`system`, `en` or `es`). `app/i18n-boot.ts` reads it once, before anything else runs, so a change applies on the next launch (see `shared/core/i18n/`).
- **Projects:** `useProjectsStore` (`projects-store.ts`) holds the projects this device knows (`projects.json` in the app data folder through `projectRegistry`): `refresh` re-reads them and recomputes `missing` (a project whose root has no `.cproject` with its id), `open(root)` records a folder (a copied project folder whose id the registry has at another folder that still holds it becomes its own project: a new id in its manifest, `copiedFrom` the old one, and a toast says so), `locate(id)` asks for the folder of a missing one (`null` on cancel, throws when the folder is another project), `setPinned`, `forget` (the folder stays), and `resolve(id, nearFile)` finds a project by walking up from a file first (the nearest manifest with that id, or one whose `copiedFrom` is that id: a copy made its own, whose record comes back with the copy's id for the caller to relink the file; an unseparated copy found there is separated as `open` does), else from the registry, fixing or filling the registry silently. Like recent files, an unreadable `projects.json` is set aside as `projects.corrupt.json`.

- **Projects settings:** `useProjectsSettingsStore` (`projects-settings-store.ts`, `cloudy-canvas:projects`) keeps where new projects go (`projectsFolder`, null for the default); `resolveProjectsFolder()` gives that folder or the default, which the New project dialog starts from.

## Updates

- **Updates:** `useUpdateStore` (`update-store.ts`) checks for and installs new versions; `useWhatsNewStore` (`whats-new-store.ts`, `openWhatsNew`) opens the "What's new" dialog; `useLastSeenVersionStore` (`last-seen-version-store.ts`, `cloudy-canvas:last-seen-version`) remembers the version the "Updated" notice last ran for. See `shared/core/app-updates/`.
