# Text

Free text on a board (T), and pasted text that no other module takes.

- **Tier:** core
- **Requires:** —; after: embed
- **Contributes:** kinds `TextKind`; boardCanvas: `kinds`, `options`, `pasteText`, `tools`; boardEditor: `selectionPanels`, `toolPanels`, `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `text.viewer.ts` (the module the HTML viewer loads instead), `text.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `text.kind.ts`, `text.tool.ts`, `text.draw.ts`, `text-measure.ts`, `text-options.ts`, `text-patch.ts`, `pasted-text.ts`, `ui/`.

## How it works

- `text/`: `TextKind`, a free label (`removeWhenEmpty`). The `text` tool types a draft, or edits the text of whatever it clicks.
- Auto width or fixed width: a label is sized to its unwrapped text (`sizing` `content`) until a resize handle drags it; `resize` sets `wrap`, keeps the new width (at least about one letter) and the side not dragged, and takes the height of its text wrapped in it (`sizing` `height`: the editor wraps and grows down too). Every handle only changes the width. The panel's Auto width toggle (`textAutoWidth`, shown for selected labels) sets `wrap` back off. `fitLabel` works out either size; `drawText` draws a wrapped label with `placeText`, so its lines align inside its width.
- A label has a `fontSize`, a `color` (bindable to a board color) and an optional look (`TextLook`: `fontWeight`, `fontStyle`, `align`; missing means regular, upright, left). Every size change (typing, the panel, Scale, Paste properties, agents) measures it again with `fitLabel`, which reads the weight, style and `wrap`, so bold text isn't clipped.
- Tool options (`TextToolOptions`: `textSize`, `textBold`, `textItalic`, `textAlign`, `textColor`/`textColorToken`) give new text its look (`textLookOf`) and, through `optionsOf`/`restyle` (`text-options.ts`), show and restyle the selected labels. Sizes stay within `TEXT_DEFAULTS.minFontSize`–`maxFontSize`; the presets are `TEXT_SIZES` and the colors `TEXT_COLORS` (`palette.ts`).
- `ui/`: `TextOptions`, the panel for the text tool and selected labels: size presets and an exact size (`NumberInput`, a scrub is one undo step), bold, italic, alignment, Auto width (selected labels only) and the color bar.
- Agents set `fontSize`, `fontWeight` (`"100"`–`"900"`), `fontStyle` (`normal`, `italic`), `align` (`left`, `center`, `right`), `wrap` and a width (`w`, which fixes the width as a handle does) with `update_shapes`; `checkTextPatch` rejects anything else.
