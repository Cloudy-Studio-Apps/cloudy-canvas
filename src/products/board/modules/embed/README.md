# Links

Pasted links shown as cards, with previews and a player for videos.

- **Tier:** feature
- **Requires:** —
- **Contributes:** kinds `EmbedKind`; boardCanvas: `kinds`, `pasteText`; boardEditor: `overlays`, `sessionHooks`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `embed.viewer.ts` (the module the HTML viewer loads instead), `embed.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `embed.kind.ts`, `pasted-embed.ts`, `embed-preview.ts`, `embed.draw.ts`, `embed.interactions.ts`, `ui/`.

## How it works

- `embed/`: `EmbedKind extends BoxKind`, a pasted link shown as a card (the board's `pasteText` makes one when the text is a single http(s) URL, `createPastedEmbed`). `provider` is `youtube` (plays in place) or `link` (opens in the browser). It's created `loading` (and again when an agent patches its `url`); `useEmbedPreviews` (`modules/embed/ui/`, a session hook) runs `loadEmbedPreview` with `http` from `@platform`, which fetches the title and picture (`fetchLinkPreview` in `shared/core/links/`: YouTube oEmbed and thumbnails, other pages' Open Graph tags), stores the picture as an asset and writes them with `doc.updateUntracked`. The height follows the width (`embedHeight`). The play and open buttons call `ctx.activate(id, EMBED_ACTIONS.…)`; `EmbedPlayer` (`modules/embed/ui/`, an overlay) handles them and only then mounts the YouTube iframe over the card (`EmbedPlayerFrame`, placed with `engine.worldRectToScreen` and `engine.onViewChange`). Icons are SVG drawn with `view.placeIcon` (`embed-icons.ts`: Lucide from the `lucide` package, YouTube from `simple-icons`).
- **HTML viewer:** `embedViewerPart` (`ui/embed-viewer-part.ts`, contributed by `embed.module.ts` and `embed.viewer.ts`): a click on a link card in the exported file opens its link in a new tab.
