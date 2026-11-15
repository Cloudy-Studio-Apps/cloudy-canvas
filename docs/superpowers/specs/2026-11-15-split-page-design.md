# Split a page into a new file — design

## Intent

A design that grew several pages can be broken up: right-click a page in the Pages list and pick
**Split into new file…**. The page moves out into its own `.cdesign` that works on its own (its
variables, pictures and data still resolve). What a page carries beyond its layers is owned by the
modules, so each module decides, through a hook, whether the new file needs something from it and
copies only that. Plugins use the same hook.

## Goals

- Right-click on a page row opens the same menu as its ⋯ button (rename, duplicate, delete).
- That menu gains **Split into new file…**, shown only when the design has more than one page.
- The new file opens in a new tab. The page leaves the current file as one undo step (undo brings it
  back; the new file stays on disk).
- In a project: the new file is saved next to the current one (same folder, free untitled-style name
  from the page name, `freeFilePath`) without asking, and gets the same project link, so the
  project's libraries sync into it on open. Outside a project: a Save dialog asks where.
- A hook, **`pageSplitSteps`**, owned by the pages module, that modules and plugins contribute to.
- Documented in the pages README, `docs/modules.md` (points list if it lists them) and
  `docs/plugins.md`.

## Non-goals

- An MCP tool for splitting (can come later on the same function).
- The Catalog mode's brochure page list (a different notion of page).
- Splitting several pages at once, or copying instead of moving (Duplicate + split covers it).

## The hook

`pageSplitSteps` (`modules/pages/ui/pages.points.ts`, exported from `modules/pages/ui/index.ts`).
Each step:

```ts
interface PageSplitStep {
  id: string;
  order?: number;
  /** Before anything is written. May show a dialog; returns data for `copy`, or `false` to cancel. */
  before?(ctx: PageSplitContext): Promise<unknown | false> | unknown | false;
  /** Copies what this module owns into the new document. Plain data writes, no UI. */
  copy?(ctx: PageSplitContext, prepared: unknown): void | Promise<void>;
}
interface PageSplitContext {
  source: CanvasDocument; // the file being split
  target: CanvasDocument; // the new file, page and its layers already in it
  page: PageElement;
  nodes: readonly CanvasElement[]; // the page's layers (as copied)
  inProject: boolean; // the source has a project link and its libraries are ready
  /** Shows a dialog over the editor (the pages module mounts its host); null when cancelled. */
  dialog<T>(render: (done: (value: T | null) => void) => ReactNode): Promise<T | null>;
}
```

Steps run in `order`: every `before` first (any `false` cancels the whole split, nothing written),
then every `copy`. A step whose module has nothing to add for this page does nothing: the check is
the step's own job ("only if needed").

## The flow (`splitPage`, pages module)

1. Steps' `before`.
2. New document (`newDesignDocument`), page and its nodes copied **with the same ids** (no clash in
   a new file, and references between them keep working). The pages module itself also copies the
   picture bytes the nodes reference (asset ids found in the nodes' data, with their `assetIndex`
   entries) and the project link when in a project. Title: the page name.
3. Steps' `copy`.
4. Encode, write (project folder, or the Save dialog's path; cancelling the dialog cancels the split),
   record in recents, open in a new tab.
5. Only after the write succeeded: remove the page from the source (`DESIGN_PAGES.remove`, after a
   `checkpoint`). A failure is a `notifyError`, the source untouched.

## Built-in steps

- **Variables** (variables module): copies token records the new file needs. In a project, only the
  file's own records (no `libraryId`); library records come in through the link. Outside a project,
  all of them (the file's design system). Nothing when the file has no tokens of its own.
- **Design system** (styleguide module): copies the hidden system page and its settings (order,
  hidden categories, template choices) only when the variables step copied something and the system
  page exists; its sheets rebuild on open.
- **Data** (data module): copies the data sources the page's layers bind to, only when there are
  bindings.

## Constraints

- Rules of CLAUDE.md: the copy logic is plain TS where it can be; the point is UI-side because
  `before` may show a dialog. Core (pages) never imports the feature modules: they contribute.
- Text through `t` (en + es), changelog entry (New), READMEs updated.

## Approaches

1. **A per-module hook (picked).** Each module copies what it owns, only when needed. Plugins can join.
   Matches the module architecture; the pages module stays ignorant of variables, data, styleguide.
2. Copy the whole document and delete the other pages. Least code, but drags everything along (all
   tokens, sources, other pages' assets until a sweep) and gives modules and plugins no say.
3. One fixed copier in the pages module that knows tokens, data and the design system. Core would
   import features, which the module rules forbid.

## Left to the builder

- Prototype connections pointing at frames on other pages stay as they are (the prototype module
  already handles a missing target, or adds a step later).
- The exact new-tab call and the Save dialog helper (reuse what Save as uses).
