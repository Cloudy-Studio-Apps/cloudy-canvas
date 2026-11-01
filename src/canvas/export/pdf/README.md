# PDF export

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

`exportPdf` makes a one-page PDF in one of two ways (`PdfExportOptions.mode`). If `sharp` fails, it falls back to `flattened`, so an export always gives a file. Catalog brochures and the Design system still use `encodePdfPages`.

- **Flattened:** `host.snapshot` at `dpi`, as one JPEG on the page.
- **Sharp:** the SVG writer ([render/vector/](../../render/vector/README.md)) runs with `target: "pdf"`, and `svgToPdf` reads its document (`DOMParser`) and writes it as PDF operators (`SvgPdfWriter`). So everything the SVG export can draw comes here for free. That target has the SVG writer flatten what PDF can't hold: effects written as filters, masks that aren't clips, semi-transparent gradients, tiled images, and text whose font can't be read. It clips gradient-filled text by its outlines.

## How the page is written

- **`PdfDocument`** holds the objects and writes the file; `PdfContent` is one content stream with the resources it names. Streams are compressed with `fflate`.
- **Groups:** a `<g>` with an opacity or blend mode is a transparency group (a Form XObject), so overlapping children fade together. Its `/BBox` reaches past any page.
- **Coordinates:** `pageMatrix` takes world units to points (PDF's y grows up). `PdfFrame` keeps the map to the current stream, because a shading pattern's matrix counts from its stream, not from the current transform.
- **Gradients:** axial and radial shadings used through patterns, so fills and strokes work the same.
- **Pictures** (`embedImages`): sized for the largest place each shows at, at `dpi` and never above its own pixels. Opaque ones are JPEGs at `imageQuality`; others keep their alpha in a soft mask.
- **Text:** always outlines. `selectable` adds a hidden layer (render mode 3) of the same text in a font whose characters are all one width, each run stretched to its outlines' width, so selecting and searching line up. Text outside Latin characters has no hidden layer.
- **Page:** `pdfPageLayout` gives `fit` the content's own size at 0.75 points a unit; paper sizes fit and center it inside the margin.
