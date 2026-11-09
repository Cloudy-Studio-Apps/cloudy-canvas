# Prototype roadmap

What Prototype mode left for later: small issues found in review and deferred. The code is described in [src/products/design/modules/prototype/](../src/products/design/modules/prototype/README.md).

## Player

- [ ] A click outside the screen (a screen smaller than the device) gives no miss flash.
- [ ] Hover and mouse-enter on the same target: only the first fires.
- [ ] The base screen's hotspot outlines show under an open overlay.
- [ ] Restart returns to the session's first screen; the mockup used the flow's start.
- [ ] The player closes silently when its start screen is gone; it should say why.
- [ ] Tab from the device picker's list focuses the dialog root.

## Editing

- [ ] A drop on a locked layer or screen counts as empty canvas and adds a Back interaction.
- [ ] Unreadable interactions are erased on any write to the layer.
- [ ] `prototype_flow_set` / `prototype_interactions_set` with unchanged values record a no-op undo step.
- [ ] Flow `page`, `start` and `name` aren't normalized on read (platform and device are).
- [ ] A stored `delay` is kept on triggers other than "after delay".
- [ ] Shift+E may be blocked inside Catalog and Design system (their command allowlists).

## Performance and cleanup

- [ ] About eight doc subscriptions each re-run `allFlows`/`screensOf`; share one.
- [ ] The picture freshness check walks the page on every render.
- [ ] The `prototype:player` workspace is never dropped.
- [ ] The selection memo doesn't follow a collaborator moving the selected layer.
- [ ] Small duplicates: cancel logic in `ConnectTool`/`PrototypeSelectTool`, `rightMiddle` in `link-path.ts`/`link-stub.tsx`, a shared `nameOf` for screen names, and the trigger icons hover/press/enter/leave share.
