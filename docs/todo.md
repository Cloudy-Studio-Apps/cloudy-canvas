# To do

## Exports

SVG, sharp PDFs and export rows are done. What's left, in the suggested order. The small Board formats don't depend on anything,
so any of them can go first.

| Format                                        | Product | Why it's useful                                                       | Effort          |
| --------------------------------------------- | ------- | --------------------------------------------------------------------- | --------------- |
| Design tokens (JSON, CSS variables, Tailwind) | Design  | Gets variables into code; today they only leave as a PDF              | Small to medium |
| PDF with one page per section                 | Board   | Large boards hit the 8192px limit and lose detail                     | Small           |
| Markdown outline                              | Board   | Turns sections, stickies and text from a workshop or retro into notes | Small           |
| Mermaid and DBML                              | Board   | Puts diagrams and schemas into READMEs and developer tools            | Small to medium |
| WebP                                          | Both    | Smaller files for the web                                             | Very small      |

### PDF, later

- Move Catalog brochures and the Design system PDF to sharp PDFs (they still use `encodePdfPages`).
- Bleed and crop marks for Catalog, and CMYK for print shops.
- Real embedded fonts, so text can be edited in other tools.

### Left out for now

- HTML/CSS: a big project of its own.
- PSD/AI and GIF/video: they cost a lot for how rarely they'd be used.
