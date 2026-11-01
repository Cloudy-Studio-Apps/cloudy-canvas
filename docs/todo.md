# To do

## Exports

SVG is done. What's left, in the suggested order. The small Board formats don't depend on anything,
so any of them can go first.

| Format                                        | Product | Why it's useful                                                           | Effort                             |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------- | ---------------------------------- |
| Vector PDF                                    | Both    | Selectable text and sharp print, which matters most for Catalog brochures | Medium, easier now that SVG exists |
| Design tokens (JSON, CSS variables, Tailwind) | Design  | Gets variables into code; today they only leave as a PDF                  | Small to medium                    |
| PDF with one page per section                 | Board   | Large boards hit the 8192px limit and lose detail                         | Small                              |
| Markdown outline                              | Board   | Turns sections, stickies and text from a workshop or retro into notes     | Small                              |
| Mermaid and DBML                              | Board   | Puts diagrams and schemas into READMEs and developer tools                | Small to medium                    |
| WebP                                          | Both    | Smaller files for the web                                                 | Very small                         |

### Left out for now

- HTML/CSS: a big project of its own.
- PSD/AI and GIF/video: they cost a lot for how rarely they'd be used.
