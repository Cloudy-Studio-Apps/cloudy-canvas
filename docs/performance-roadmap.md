# Performance roadmap

What could make the canvas cheaper as files, features and live sessions grow, with when each one is worth doing. Nothing here is needed today: each item has a **trigger**, the sign that it has become worth its cost. Measure before doing any of them (see the end).

**Already done:** off-screen views are culled every frame (`ElementLayer.cull`, `ElementView.cull`), a moved view is only moved (`viewChange`), opening a file builds views a slice at a time (`syncElementsChunked`), text textures are capped by size (`cappedTextResolution`), pictures are decoded as sharp as they show and let go off screen (`ImageCache`), exports and agents' views draw their own views (`drawSnapshot`), agents' workspaces have no views at all (headless `Scene`).

**What culling doesn't cover:** being off screen only skips the GPU pass. Off-screen views are still *drawn* (`kind.draw`) on every change, and still re-rasterize their text on zoom.

**Suggested next:** the two items under "Cheap, low risk" once a design page with many texts or an agent's large selection feels slow.

## Cheap, low risk

- [ ] **Text sharpness only for what's on screen.** `ElementLayer.setTextZoom` gives every view its new resolution, and `RichTextSprite.setResolution` draws a new canvas texture right away, for every design text on the page, on screen or not, each time the zoom crosses a step (`textResolution`).
  - A culled `ElementView` keeps the resolution and applies it when `cull` shows it again. Its drawing and extent don't change, so nothing else needs to know.
  - **Trigger:** zooming stutters on pages with a few hundred texts.
  - **Risk:** a text scrolling in may be soft for one frame.
- [ ] **Collaborators' outlines only for what's on screen.** `CollaboratorSelections` works out `engine.elementsBounds([id])` and renders a div for every id each collaborator selected, on every view change.
  - Leave out boxes that don't meet `engine.visibleWorldRect()`, with the name tag on the first one shown.
  - **Trigger:** panning is slow while an agent or a guest has a large selection (agents keep what they just made selected).
  - **Risk:** none, it's DOM only.

## Worth it when files get large

- [ ] **Build what's on screen first when a file opens.** `syncElementsChunked` builds views in document order; sorting the list so elements meeting the fitted view come first shows the first picture sooner. The rest keep building as now.
  - **Trigger:** large files (thousands of elements, big Figma imports) take long to show anything.
  - **Risk:** small. Mask sources and effect scopes are synced once per batch already, so order doesn't matter to them.
- [ ] **Font loading by what's on screen.** `mount` waits for every face the scope uses (at most 8 s). Waiting only for the faces of what shows, and loading the rest after, opens text-heavy files sooner.
  - **Trigger:** files with many fonts open slowly, mostly offline or with Google fonts not cached yet.
  - **Risk:** text off screen shows in a fallback face until its font arrives (it's redrawn then, as now).

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

- [ ] **Cached scopes:** draw an unchanged effect or mask scope once into a texture and reuse it between frames (CLAUDE.md lists "caching effect scopes between frames" as not done).
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
