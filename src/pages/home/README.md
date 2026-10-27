# Home

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Layout

- **Home (`/`, `home-page.tsx`):** the top bar (`TopBar`: collaborators, Join, Agents, theme, Settings; the wordmark opens About), then one of two pages. Ctrl+O opens a file (`useOpenFile`: the native dialog, Figma and FigJam files imported), Ctrl+, the settings, and files dragged onto the window show `DropOverlay`.
- **First run** (no recent files): `Welcome` (the logo, what the app makes, `CreateTiles` with their longer `welcome.*` hints, `OpenFileTile`, the drop hint, and `SealsVideo` playing on the right) and `StartersRow`.
- **With files:** `ContinueSection` (the "Continue where you left off" `ContinueCard` beside `CreateColumn`), then `RecentFiles` without the file the card shows. The card's file is the most recent one that isn't missing (`missing` in `recent-files-store`); when every file is missing, only the create column shows. The card has the file's preview, kind, time and location, Open, the next three files as one-line links, and the file's context menu.
- **Create column** (`create-column.tsx`): `CreateTiles` (New board, New design, New catalog: `?mode=catalog`), `OpenFileTile` (the dashed Open file tile, also on the first-run page), then `SealCard`: the seals' poster frame, playing only while hovered or focused; a click opens About (where the video plays too); its × hides it (`useHomeStore.sealsHidden`, `shared/stores/home-store.ts`), leaving a "Bring them back" line.

## Recent files

- **Kinds** (`file-kind.ts`): a design left in Catalog mode is shown as a **catalog** (`fileKindOf`: the mode each design was left in, `useDesignModeStore` from `@design/ui`, which is per device, so a catalog opened only elsewhere shows as a design until it opens here). `FileKindIcon` is `FileTypeIcon`, with `CATALOG_STYLE` (a book on the accent tint) for catalogs; `KIND_TINT` and `KIND_LABEL` give each kind's wash and name.
- **Toolbar** (`RecentFilesToolbar`): search (name, title, description), the kind tabs (All, Boards, Designs, Catalogs; `filterRecentFiles(files, filter, kindOf)`), the sort order and `RecentFilesViewToggle` (grid or list, `useHomeStore.recentView`, kept between sessions).
- **Grid** (`FileCard`) and **list** (`RecentFilesList`, rows `RecentFileRow` in the columns of `recent-files-columns.ts`: preview, name, kind, location, edited, ⋯). Both draw the picture with `FilePreview` (`useFileThumbnail`, or the kind's icon) and share the file's actions (`useFileActions`: the ⋯ menu, the context menu, and `MissingFilePopover` for a missing file, which offers Locate instead of opening).

## Starters

- **Starters** (`StartersRow`, `StarterCard`, `use-starters.ts`): the modules' ready-made starts, read from the board's and the design's core points (`boardStarters`, `designStarters`; plugins add theirs) and listed boards first, each by `order`. A card opens `/<product>/<new id>?starter=<id>`, and the editor's `useStartStarter` (`canvas-ui/starters/`) fills the new file. Built in: ER diagram (er), Database schema (db), Retrospective (section), Mobile app and Desktop landing (frame), A4 brochure (catalog).

The page's strings are `t` from `home.i18n.ts` (`locales/`).
