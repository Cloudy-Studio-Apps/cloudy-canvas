# PDF bookmarks and page links (catalog roadmap C3)

Status: approved 2026-11-04; plan: [2026-11-04-pdf-bookmarks.md](../plans/2026-11-04-pdf-bookmarks.md). Roadmap item:
[C3](../../catalog-roadmap.md#c3-bookmarks-and-links-in-the-pdf).

## Intent

A brochure exported from the Catalog mode should open in any PDF reader the way a professional PDF
does: an outline in the reader's sidebar that follows the brochure's sections, a table of contents
whose lines take you to their page, and cross-references ("see page 12") that stay right when pages
move and also take you there. The user's words: "as normally see when open a pdf with marks, and
clickable redirects", and the table of contents and the bookmarks "work together smoothly".

## Goals

1. **Bookmarks (the PDF outline).** Every brochure PDF gets an outline built from the same entries
   as the table of contents (`tableOfContents`, `model/page-items/table-of-contents.ts`): a bookmark
   per section, nested like the sections are (`placeSections` depth, `PageInfo.path`), each opening
   its section's first printed page. A brochure with no sections gets a bookmark per numbered page,
   named by its frame, just as the table of contents falls back to listing pages. So the two always
   list the same things in the same order.
2. **A clickable table of contents.** In the exported PDF, each line of a `{toc}` text is a link to
   the page its entry opens. It works wherever a `{toc}` text is: on a page, or a master's copy on
   pages.
3. **`{page:Name}` cross-references.** A new token that writes the printed page label ("12", "iv")
   of the section or page called `Name`, re-read with the other page items so it follows pages as
   they move. In the PDF, the number it wrote is a link to that page.
4. **Nothing to set up.** All of this is on in every brochure export, sharp or flattened
   (`settings.pdfMode`), with selectable text on or off. CMYK (PDF/X) exports keep the bookmarks
   and leave the links out (my call: PDF/X restricts annotations on the page, and a press file
   doesn't need them).

## Non-goals

- **Web links and links on any text** ("Visit our shop" → a URL, auto-linking `www.…`). These are
  the editor's own linking feature and get their own plan (user's decision).
- The general Design export (`exportPdf` of frames) and the board's PDF export: brochures only for
  now. The writer-side pieces (outline, link annotations) are written so a later plan can reuse them.
- A bookmark editor (renaming or hiding bookmarks apart from sections).
- Bookmarks or links in the in-app 3D preview.

## Anti-goals (would be a failure even if it technically works)

- The outline and the table of contents disagreeing: a section in one and not the other, a
  different order, or a link opening a different page than the number printed next to it.
- A link landing on the wrong PDF page when spreads are split or not (`splitSpreads`), when blank
  pages are added by the layout, or when covers are uncounted.
- Breaking PDF/X validity: link annotations must be allowed by the PDF/X level written (X-4 and X-1a
  allow `/Link` annotations whose rectangle is outside the trim or with no visible border; they must
  have no appearance that prints: `/F 4`-style flags off for print isn't enough, use `/Border [0 0 0]`
  and no `/AP`). The builder checks the standard and keeps the output valid.
- Visible boxes or colors around links in the printed or on-screen page.

## How it works (decided)

### The PDF writer (`src/canvas/export/pdf/`, plain TS, product-agnostic)

- `PdfDocument` learns two things:
  - an **outline**: a tree of `{ title, page (index of a page added), children }`, written at save as
    `/Outlines` with `/First`/`/Last`/`/Next`/`/Prev`/`/Parent`/`/Count`, titles as UTF-16BE text
    strings (with BOM) so any language works; the catalog gets `/PageMode /UseOutlines` so readers
    open the sidebar. A destination is `[page /XYZ null null null]` or `/Fit` (builder's call).
  - **link annotations** on a page: rectangles in that page's PDF coordinates with a destination page
    index, written as `/Annots` on the page (`/Subtype /Link`, `/Border [0 0 0]`, `/Dest`). Links may
    point forward to pages not yet added, so they're resolved at save.
- `PdfBook` exposes this to callers: `add`/`addBlank` return (or let you know) the PDF page index
  they made; a way to attach links to a page given in **world coordinates** of that page's area,
  which `PdfBook` maps through the page's layout (`pdfPageLayout`: scale, bleed, crop-mark band),
  and `setOutline(tree)` before `save`.

### The catalog (`products/design/modules/catalog/`)

- **Side → PDF page.** `printedPages` gives the PDF's pages in order; the export keeps a map from each
  layout side (and half) to the PDF page index that shows it, so a destination for "the section's
  first page" is right whether a spread is split or printed whole.
- **One source of entries.** The table of contents' entry list (section or page, depth, label, the
  side it opens) is pulled out of `tableOfContents` into a function both the `{toc}` text and the
  outline use; `tableOfContents` becomes "format those entries as lines". This is what keeps goal 1's
  "always the same list".
- **Link areas come from the layout, not from the PDF's text runs.** The flattened mode has no text
  runs, and the hidden text layer exists only with selectable text. So the export works out, for each
  `{toc}` text and each text with a `{page:…}` on the printed frame, the box of each of its lines in
  world coordinates (from the text's own layout, the same one the canvas draws), and gives `PdfBook`
  one link per line: the TOC's line _i_ to entry _i_'s page. A TOC line's link covers the whole line
  across the text box's width, leader and number included. Lines of a text that's clipped or hidden
  are left out.
- **`{page:Name}`** joins `resolveTemplate`'s tokens. `Name` is matched against section names first,
  then page frame names (trimmed, case-insensitive); the first match in reading order wins. It writes
  that page's printed label, empty for an uncounted page. Unmatched, it writes `??` and the brochure's
  checks (`brochureIssues`) report "A page reference points to no page", naming the text.

## Calls I made (marked as mine)

- Bookmarks are titled with the section's name only, without the page number.
- With no sections, bookmarks list numbered pages by frame name (mirrors the TOC fallback).
- Readers open with the outline showing (`/PageMode /UseOutlines`).
- `{page:Name}` matches sections before frame names, case-insensitive; unmatched writes `??` plus a
  check.
- A `{page:…}` link covers only the words it wrote (the layout's fragments for that range), not
  the whole text.
- Rotated texts get no links.

## Left to the builder

- File layout, names and splitting, following the module rules.
- Exact PDF destination form (`/XYZ` vs `/Fit`) and how outline items open (expanded or folded).
- How line boxes are read from the text layout (whatever the text module already measures).
- Agent tools: `export_brochure_pdf` needs no new arguments; `get_brochure` may list unmatched
  references. Update the catalog and PDF READMEs and both changelogs (user-facing, under New).

## Where `{page:Name}` is written (my call, approved with the plan)

A new page item, **Page reference** (`page-ref`), inserts a text whose template is
"see page {page:…}" (localized). Its target is picked in the Design mode's properties panel
(a `SelectField` of the brochure's sections and pages), never typed. Page-item texts become editable
as templates: the catalog contributes a `textTemplates` source, so the text editor opens on
`catalogText` ("see page {page:Specs}") and writes it back, and the sync resolves it. Plain text
typed on a page is still not a template.
