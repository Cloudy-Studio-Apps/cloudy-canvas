# Text

Text layers (T) with mixed styles in one text, the Typography section and its font picker, text styles and outlines for export.

- **Tier:** core
- **Requires:** core, variables
- **Contributes:** kinds `TextKind`; designCanvas: `afterEdit`, `kinds`, `options`, `tools`; designEditor: `propertySections`, `sessionHooks`, `tools`; `designMcpTools`, `designStyleTypes`
- **Points it owns:** —
- **MCP tools:** `list_fonts`, `style_text_range`
- **Files:** `text.kind.ts`, `text-layout.ts`, `text-spans.ts`, `text-style.ts`, `run-style-bindings.ts`, `text-outline.ts`, `text.mcp.ts`, `ui/` (Typography, font picker, text styles).

## How it works

### Mixed text

- **Mixed text** (`text/`): a text's `runs` (`TextNodeRun`: a `TextRunStyle` of typography, `fills`, `textDecoration` over the text's own) and `textDecoration` are drawn, sized and outlined through one layout (`textLayout`, cached; `textSpans` resolves each stretch's style, `textFrame` where it wraps), so the editor's caret, the drawing and `textOutline` (each fragment shaped in its run's face at its place; decorations included) agree. `TEXT_RICH` is its `RichTextSpec` (`textContentPatch`, Ctrl+B/I/U toggles); `text.set` moves runs with the change. The Typography section reads and writes a `TypographyTarget` (`useTypographyTarget`: the selected characters while editing, with a color field, `rangeStyleValue`; otherwise whole texts, clearing the field from their runs, `textStyleValue`) and has underline/strikethrough buttons. Agents: `runs` and `textDecoration` in `create_nodes`/`update_nodes` (`text-run-args.ts`: a new `text` moves the runs, a whole-text field clears them), `style_text_range`. The Figma import maps `characterStyleIDs` + `styleOverrideTable` (`fig-text-runs.ts`; `withFigStyles` applies the entries' own styles) and decorations (`fig-typography.ts`).

### Text

- **Text** (`text/`): `TextKind` (`text`, `fontFamily` (a family name), `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`, `textAlign`, `verticalAlign`, `autoResize`: `width`/`height`/`none`); one visible solid fill is its color; other fills (gradients, images, several paints) show through its glyphs (`setPaintTextMask`; `strokable` is off), its layer is named after its first line (`layerName`) until renamed, and `textSize`/`retypeset` lay it out again after any change (resizing a side fixes the width, the height the size). `TextTool` (T): click for auto width, drag for a fixed width, click a text to edit it. The Typography section has `FontPicker` (`useFontFamilies`, a searchable list of installed and Google families), the face, size, line height, letter spacing, alignment and resizing; its changes become the `textTypography` tool option new texts use.

### Text outlines

- **Text outlines:** `TextKind(outliner)`'s geometry is its glyphs (`textOutline`: its lines wrapped as drawn, aligned, on their baselines, letter-spaced, then `normalizePath`), from a `GlyphOutliner` (`shared/core/fonts`; `glyphOutliner` in `@platform`: HarfBuzz, `harfbuzzjs`, loaded the first time text is outlined, excluded from Vite's pre-bundling; each face read once from `FontLibrary.fontData`: an installed face's file from the Rust `system_font_data` command, a Google face as TTF fetched with an old user agent and cached as `face.ttf`). Until a face is read the text has no shape; `useTextOutlines` then calls `engine.refreshElements` on its texts, so booleans and masks made of them update.
