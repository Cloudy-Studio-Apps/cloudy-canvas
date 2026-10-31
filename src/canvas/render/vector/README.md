# SVG export

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

`drawSvg` turns the off-screen tree of an export (`withSnapshotTree`, the same one `drawSnapshot` draws) into an SVG document. It reads what the kinds drew, not the elements, so every element type, link and plugin kind comes out as it looks with no SVG code of its own, and nothing here asks what type an element is.

- **The walker** (`walk-display.ts`): each display object becomes a `<g>` with its transform, opacity, blend mode and clip, and a writer picked by its class: `write-graphics.ts` (Pixi's `context.instructions` as `<path>`s, through `path-data.ts`), `write-image.ts`, `write-text.ts`, `write-mask.ts`, `write-effects.ts`. Pixi's `cut` also adds a shape's second and later holes to the shape before it, harmless on the canvas but filled in an even-odd path, so `ownHoles` drops those copies. What masks something is left out of the content; a clip that's the node's child is in the node's coordinates, a sibling in its parent's. Rich text places itself: its sprite sits at its ink, its layout at the text box.
- **Flattening** (`flatten.ts`): a writer answers `null` for what SVG can't express, and that object alone is drawn as a PNG (moved into a holder for the moment, so its transform and filters count): angular and diamond gradients, inverted alpha and luminance masks, effects without an `svg` writing, and anything else that draws (a plugin's mesh). Everything round it stays vector.
- **Pictures** embed their original files (`ExportImages.file`), found from a texture's source, once per file (`<use>`), so they stay as sharp as the originals. A crop is a clip of the texture's frame.
- **Text:** with `outlines`, `resolveFaces` first reads every face used (`GlyphOutliner.prepare`, taking the first family of the list that has a file, as the canvas falls back along it, 8 s at most each), and each run is written as glyph paths (`outlineRun`). A text whose face can't be read, and all text with `live`, is `<text>` on its baselines. Pixi texts are placed as `CanvasTextGenerator` places them.
- **Effects:** `EffectRenderer.svg` gives a renderer's filter steps (`""` leaves it out, as background blur, which needs what's behind; `null` or nothing flattens the scope). They chain in `EFFECT_STAGES` order inside one `<filter>`.
- **Masks:** clips and vector masks are `<clipPath>`s, an inverted vector mask a `<mask>` with the shape cut from a white rect, alpha and luminance masks `<mask>`s (`mask-type: alpha` for alpha), and paints shown through a text a `<mask>` of it in white.

`mask-type: alpha` and `mix-blend-mode` work in browsers; other editors vary.
