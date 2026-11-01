# To do

## Exports

SVG, sharp PDFs, one PDF page per section or frame, WebP, export rows, Mermaid and `.dbml` files are done. What's left, in the suggested order.

| Format                                        | Product | Why it's useful                                                       | Effort          |
| --------------------------------------------- | ------- | --------------------------------------------------------------------- | --------------- |
| Design tokens (JSON, CSS variables, Tailwind) | Design  | Gets variables into code; today they only leave as a PDF              | Small to medium |
| Markdown outline                              | Board   | Turns sections, stickies and text from a workshop or retro into notes | Small           |

### PDF, later

- Move Catalog brochures and the Design system PDF to sharp PDFs (they still use `encodePdfPages`).
- Bleed and crop marks for Catalog, and CMYK for print shops.
- Real embedded fonts, so text can be edited in other tools.

### Left out for now

- HTML/CSS: a big project of its own.
- PSD/AI and GIF/video: they cost a lot for how rarely they'd be used.
