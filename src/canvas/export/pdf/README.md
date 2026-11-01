# PDF export

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

`exportPdf` writes a PDF of one or more pages in one of two ways (`PdfExportOptions.mode`). `PdfBook` (`workspace.pdfBook(options)`) does the same a page at a time, for exports that change design page between pages, report progress or add blank pages (Catalog brochures, the Design system). `pointsPerUnit` says how big a world unit prints: 0.75 by default, 1 for brochures. A page that fails in `sharp` falls back to `flattened`, so an export always gives a file. Catalog brochures and the Design system still use `encodePdfPages`.

- **Flattened:** `host.snapshot` at `dpi`, as one JPEG on the page.
- **Sharp:** the SVG writer ([render/vector/](../../render/vector/README.md)) runs with `target: "pdf"`, and `svgToPdf` reads its document (`DOMParser`) and writes it as PDF operators (`SvgPdfWriter`). So everything the SVG export can draw comes here for free. That target has the SVG writer flatten what PDF can't hold: effects written as filters, masks that aren't clips, semi-transparent gradients, tiled images, and text whose font can't be read. It clips gradient-filled text by its outlines.

## How the page is written

- **`PdfDocument`** holds the objects and writes the file; `PdfContent` is one content stream with the resources it names. Streams are compressed with `fflate`.
- **Groups:** a `<g>` with an opacity or blend mode is a transparency group (a Form XObject), so overlapping children fade together. Its `/BBox` reaches past any page.
- **Coordinates:** `pageMatrix` takes world units to points (PDF's y grows up). `PdfFrame` keeps the map to the current stream, because a shading pattern's matrix counts from its stream, not from the current transform.
- **Gradients:** axial and radial shadings used through patterns, so fills and strokes work the same.
- **Pictures** (`embedImages`): sized for the largest place each shows at, at `dpi` and never above its own pixels. Opaque ones are JPEGs at `imageQuality`; others keep their alpha in a soft mask.
- **Text:** always outlines. `selectable` adds a hidden layer (render mode 3) of the same text in a font whose characters are all one width, each run stretched to its outlines' width, so selecting and searching line up. That font (`HiddenTextFont`, as OCR tools do it) is 252 bytes with an empty glyph; each character gets a code as it first appears, and a `/ToUnicode` table written at save says what the codes mean, so any character works, emoji included, and the pages of a document share one font.
- **Pages:** one, or with `pages: "frames"` one for each of the product's frames (`pdfPageGroups`, from `CanvasProduct.frames`: a board's sections in reading order, a design's top-level frames), with what moves with it, then a last page for what's in none. A frame inside another stays on that one's page. Each page is sized on its own, so a large board keeps its detail. The Export dialog offers it when the product passes `framePagesLabel`; agents have `pdf.pages`.
- **Colors** (`color/`): everything that writes a color or a picture asks a `PdfColorOutput`, so nothing else knows the color space. `RGB_OUTPUT` is the default.
- **Print pages** (`print/`, `PdfExportOptions.print`): the page is the trim plus the bleed plus a band for crop marks (`printPageLayout`), with `TrimBox` and `BleedBox`. Content is drawn past the trim by the bleed and clipped to it. `PdfBook.add`'s `prepare` changes elements for one page, and their clips are worked out again from what's drawn (`ExportHost.clipsOf`), because a grown frame has to clip further than the one on the canvas.
- **Page:** `pdfPageLayout` gives `fit` the content's own size at 0.75 points a unit; paper sizes fit and center it inside the margin.
