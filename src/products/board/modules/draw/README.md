# Draw (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Stroke

- `stroke/`: `StrokeKind extends LineKind`, a freehand stroke drawn with a `pen`: `"pen"` or `"highlighter"` (translucent, flat ends; the outline settings per pen are in `STROKE_DEFAULTS`). The `marker` tool (M) draws with the `drawPen` option, each pen with its own color and size options; with `drawSmooth`, the points are smoothed on release (`smoothPoints`: simplify, then round the corners), so nothing in the data marks it. Selected strokes are recolored and resized from the panel (`restyle`). The `eraser` tool (Shift+E) removes whole strokes: the ones it touches fade (`ctx.setFaded`) and are deleted on release as one undo step. The toolbar's Draw button stays active for both tools (`subTools` on its tool entry), and its panel is `ui/draw-options.tsx`. Agents draw strokes from `points` (a flat world-space list, plus `pen`, `size`, `smooth`; `stroke-spec.ts`) and patch their `color` and `size` (`strokeSizePatch`, shared with `restyle`).
