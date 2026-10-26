# Embed (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Embed

- `embed/`: `EmbedKind extends BoxKind`, a pasted link shown as a card (the board's `pasteText` makes one when the text is a single http(s) URL, `createPastedEmbed`). `provider` is `youtube` (plays in place) or `link` (opens in the browser). It's created `loading` (and again when an agent patches its `url`); `useEmbedPreviews` (`modules/embed/ui/`, a session hook) runs `loadEmbedPreview` with `http` from `@platform`, which fetches the title and picture (`fetchLinkPreview` in `shared/core/links/`: YouTube oEmbed and thumbnails, other pages' Open Graph tags), stores the picture as an asset and writes them with `doc.updateUntracked`. The height follows the width (`embedHeight`). The play and open buttons call `ctx.activate(id, EMBED_ACTIONS.…)`; `EmbedPlayer` (`modules/embed/ui/`, an overlay) handles them and only then mounts the YouTube iframe over the card (`EmbedPlayerFrame`, placed with `engine.worldRectToScreen` and `engine.onViewChange`). Icons are SVG drawn with `view.placeIcon` (`embed-icons.ts`: Lucide from the `lucide` package, YouTube from `simple-icons`).
