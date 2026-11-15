# Performance roadmap

What could make the canvas cheaper as files, features and live sessions grow, with when each one is worth doing. Nothing here is needed today: each item has a **trigger**, the sign that it has become worth its cost. Measure before doing any of them (see the end).

**Already done:** off-screen views are culled every frame (`ElementLayer.cull`, `ElementView.cull`), a moved view is only moved (`viewChange`), opening a file builds views a slice at a time (`syncElementsChunked`), text textures are capped by size (`cappedTextResolution`), pictures are decoded as sharp as they show and let go off screen (`ImageCache`), exports and agents' views draw their own views (`drawSnapshot`), agents' workspaces have no views at all (headless `Scene`).

**What culling doesn't cover:** being off screen only skips the GPU pass. Off-screen views are still _drawn_ (`kind.draw`) on every change, and still re-rasterize their text on zoom.

**Suggested next:** the two items under "Cheap, low risk" once a design page with many texts or an agent's large selection feels slow.

## Cheap, low risk

- [x] **Text sharpness only for what's on screen.** A culled `ElementView` keeps the zoom's text resolution and applies it when `cull` shows it again (`textResolutionStale`), so a zoom step only redraws the texts on screen. A text scrolling in may be soft for one frame.
- [ ] **Collaborators' outlines only for what's on screen.** `CollaboratorSelections` works out `engine.elementsBounds([id])` and renders a div for every id each collaborator selected, on every view change.
  - Leave out boxes that don't meet `engine.visibleWorldRect()`, with the name tag on the first one shown.
  - **Trigger:** panning is slow while an agent or a guest has a large selection (agents keep what they just made selected).
  - **Risk:** none, it's DOM only.

## Worth it when files get large

- [x] **Build what's on screen first when a file opens.** `mount` builds the views meeting the fitted view first (`onScreenFirst`, shared with `buildScopeViews`), so the first picture shows sooner.
- [ ] **Font loading by what's on screen.** `mount` waits for every face the scope uses (at most 8 s). Waiting only for the faces of what shows, and loading the rest after, opens text-heavy files sooner.
  - **Trigger:** files with many fonts open slowly, mostly offline or with Google fonts not cached yet.
  - **Risk:** text off screen shows in a fallback face until its font arrives (it's redrawn then, as now).

- [ ] **Data iterators: cheaper nested syncs.** `syncIterators` (data module) reads the layer tree once per sync, but every iterator that writes copies drops it (`dataScopes.invalidate`), so the next one reads the whole document again: with nested iterators that's one full read per inner copy (24 outer copies, 24 reads). Picking the next iterator scans the pending ones each time (fine for tens). And any change to a copy (auto layout moving it included) plans its whole iterator again, once per pass.
  - Keep the children map up to date from each plan (`add`, reparenting `patch`, `remove`) instead of reading it again, and keep pending iterators in a heap by depth.
  - **Trigger:** a document with nested iterators (or hundreds of copies) makes edits inside a template, or an Update, visibly slow.
  - **Risk:** small: a stale children map would plan from a tree that isn't there, so the incremental update must mirror `writeDataCopies` exactly.
- [ ] **Brochure repeats: fewer expansions.** Every local write inside a brochure's template page (each drag step and keystroke, and the passes that follow data and page-item fills) re-runs `syncBrochureRepeats` in full: `expandBrochure`, a `childrenMap` of the whole document and `planPageCopy` for every copy made, which only writes what differs. Separately, every `DesignBrochure.pages()`/`layout()` call (the UI calls both often) and every `syncPageItems` pass expands the brochure again.
  - Memoize `brochureExpansion` per record and root (or per document version), and plan only the copies of the template pages the edit touched when neither the record nor a source changed.
  - **Trigger:** a brochure with repeats and many pages made (or an export's scratch copy) makes typing or dragging on a template page visibly slow.
  - **Risk:** small: a stale expansion would number or copy from rows that changed, so the memo key must include every source snapshot and the record.

## Entering the Catalog mode on a large design

Switching a large design (5,575 layers, a 28-page brochure) from the Design mode to the Catalog mode froze the screen for a moment. What runs on entry, most suspect first, and what to do about each. Profile the switch (dev tools, Performance) to see which one is left.

- [x] **A. One brochure read for the whole UI.** `useBrochure` was called by about 44 components, each with its own `useMemo`, so every document change (and the entry, and the arrange that follows it) ran `brochure.pages()`, `bookLayout`, `pageNumbers` and `printedLabels` once per component. They now share one read per scope and version (`use-brochure.ts`).
- [ ] **B. Dim less often.** `catalogFaded` builds a children map of the whole document and walks it (`withDescendants`) on every `refreshScene`, not only on the switch. Memoize it on the brochure's printed and master frames and the scene's element set, so a move doesn't redo it.
  - It runs once per switch (`setMode` → `applyFaded`; `setTool` dims under the default mode first, which costs nothing), so caching it doesn't speed the switch up; it saves work on every edit made in the Catalog mode. Its real cost is `brochure.pages()` (a brochure expansion), see "Brochure repeats: fewer expansions".
  - **Trigger:** edits in the Catalog mode feel slow.
- [x] **C. The canvas first, the panels a frame later.** Every mode's overlays (`whileOn`), the design's mode sidebar and its left panel tabs mount in the kit's `Deferred` (`useDeferredValue(true, false)`), with a `PanelSkeleton` until they're drawn. Hides what's left, doesn't remove it.
- [x] **Coming back to a large page.** Showing a scope (`setScope`, a mode that shows its own page like the Design system's, a plugin's) built every view at once. It builds them a slice at a time now, what's on screen first (`buildScopeViews`).
- [x] **Thumbnails after the switch.** A profile after A showed the CPU busy for ~6 s after entering: all 28 page thumbnails drawing one by one. `ElementThumbnail` now asks for its picture only once the tile has come into view (`useInView`, 200 px ahead), and pulses until it's drawn, so a long page list draws only the rows shown.
- [x] **D. Skeletons for thumbnails only.** Done with the item above (the tile pulses until drawn).
- [x] **Print checks in one pass.** Measured in the app with a temporary probe: `checkBrochure` blocked the window 2.6 s about a second after entering (switching back to the Design mode then waited for it, which looked like that switch freezing). `shownNodes` read the whole document (18,788 elements) for each page, twice per page and again in `repeatIssues`. It now indexes the layers once per element list (a `WeakMap`), so the checks take ~0.3 s; `repeatIssues`' data issues are most of what's left.
- [ ] **E. Off the main thread.** Each thumbnail is one long render, and the print checks (`checkBrochure`) read `doc.all()` and picture files. Move them to a worker / `OffscreenCanvas`.
  - **Trigger:** a profile shows thumbnails or checks as the long tasks after the switch. Large work: last.
- [x] **Arrange on entry.** Already cheap: `arrangeBrochure` writes only what moves and the document notifies only on a real change, so an entry with nothing to move changes nothing. What's left is the computing (a brochure expansion), see "Brochure repeats: fewer expansions".

## Worth it with heavy collaboration or agents

- [ ] **Deferred redraws for off-screen views.** A document change redraws every changed view (`handleDocumentChange` → `renderer.syncElements` → `kind.draw`), seen or not. A view that's culled and whose new bounds stay out of view could keep the change pending and draw it when it shows (`cull` flushes it before `app.render()`). The same pending state would cover `redrawImages` and `refreshText`.
  - **Pros:** guests' and agents' edits far from your view cost almost nothing on your machine; scales to large files with busy sessions.
  - **Cons:**
    - Culling would rely on an estimate (old drawn extent ∪ new `elementBounds`), not what was drawn. What draws past its box (frame name labels, DB notes, ER labels, shadows, blurs) needs margins or may show a frame late.
    - Views in a `MaskSource` must never be deferred (drawn into the mask even off screen); clips depend on the drawn extent (`clipCovers`), so `setClip` has to wait for the flush too.
    - Anything reading views instead of the scene must flush first (`captureView` does through `cull(rect)`; new code would need to remember it).
    - The cost moves rather than disappears: panning onto many pending edits, or a thumbnail, flushes them in one frame.
    - A new kind of bug: "my change didn't show", hard to reproduce in a live session.
  - **Trigger:** a profile shows `kind.draw` of off-screen ids during agent calls or remote updates being a real share of frame time. Not before.
- [ ] **Off-screen collaborators at the canvas edge** (Figma's avatars on the border pointing at them). Mostly a feature, but it also replaces DOM cursors far outside the view.
  - **Trigger:** sessions with several people or agents on one page.

## Bigger changes, only if the ones above aren't enough

- [ ] **Cached scopes:** draw an unchanged effect or mask scope once into a texture and reuse it between frames (`src/products/design/README.md` lists "caching effect scopes between frames" as not done).
  - **Trigger:** pages with many shadows, blurs or glass effects pan slowly.
- [ ] **Tiles at low zoom:** draw the whole page into cached tiles when zoomed far out, instead of every view.
  - **Trigger:** zoomed-out views of very large files are slow even with culling.
- [ ] **Drawing off the main thread** (OffscreenCanvas, a worker). A large rework; deferred redraws above would need rewriting for it, so don't do both.

## Problems to expect as the app grows

- **New element kinds that draw outside their bounds** make culling (and any deferring) miss them: keep what a kind draws inside what `extent()` reports, or give it an effect-like outset.
- **More text on design pages** (plugins, imports) makes zoom re-rasterizing the first thing to feel slow.
- **Agents making hundreds of nodes per call** make document-change redraws and collaborator overlays the hot path, not rendering.
- **Live sessions with many guests** multiply remote updates; each one is synced and redrawn wherever it lands.
- **Code that reads views instead of the scene** gets harder to keep correct if any of the deferring above is added. Read geometry from the scene.

## How to measure

- The browser's Performance panel in `pnpm tauri dev` (Web Inspector): record a zoom, a pan, an agent call; look for `ElementView.sync`/`kind.draw`, `RichTextSprite.redraw` and React renders of `CollaboratorSelections`.
- Test files: a Figma import with many frames and texts, a board with a few thousand stickies, and an agent creating 300 nodes away from the view.
- Decide by frame time (16 ms at 60 Hz): fix what shows up, leave the rest here.
