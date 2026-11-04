# PDF bookmarks and page links (C3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brochure PDFs get a sidebar outline that mirrors the table of contents, clickable table of
contents lines, and `{page:Name}` cross-references that follow pages and link to them.

**Architecture:** The product-agnostic PDF writer (`src/canvas/export/pdf/`) learns outlines and
`/Link` annotations to page indexes. The catalog pulls one list of contents entries out of
`tableOfContents`, which feeds the `{toc}` text, the outline and the links. A template now resolves
into text plus link ranges. At export, those ranges become boxes from the text's own layout
(`textLayout`), so links work in sharp and flattened PDFs alike.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), the in-house PDF writer, React 19
for the one properties section, i18n with `en`/`es` locales.

**Spec:** [docs/superpowers/specs/2026-11-04-pdf-bookmarks-design.md](../specs/2026-11-04-pdf-bookmarks-design.md)

## Global Constraints

- There is no test framework. Every task is verified with `pnpm lint`, `pnpm typecheck` and
  `pnpm format:check` only. Never run `tauri dev`, cargo, builds or browser checks. Where a TDD step
  would go, each task lists **acceptance checks**: the implementer traces them in the code and states
  the result in the task report.
- Work on `master`. Commits use Conventional Commits and carry **no** `Co-Authored-By` line.
- `src/canvas/` is plain TS: no React, no product imports. The catalog reaches text only through
  `../../text` (it's in `uses`).
- One concern per file, about 200 lines at most; every `interface`/`type` goes in a sibling
  `.types.ts`, re-exported with `export type`.
- User-facing text goes through `t` (`catalog.i18n.ts`, `locales/en.json` + `locales/es.json`).
  MCP text, thrown errors and PDF internals stay English.
- Read the `README.md` of every folder you change, and update it in the same commit when behavior
  changes: `src/canvas/export/pdf/README.md` and `src/products/design/modules/catalog/README.md`.
- Every user-facing change adds an entry under Unreleased in `CHANGELOG.md` and `CHANGELOG.es.md`
  (Task 5 and Task 4, see there).
- No links in PDF/X: when `options.print?.color` is set, outlines are written and link annotations
  are not.
- Unmatched `{page:Name}` writes `??`.

## Review Focus

1. **A TOC entry that wraps onto two lines**: both layout lines link to the same page (Task 5, check
   5.3).
2. **Unsplit spread frames** (`splitSpreads: false`): a section starting on a spread's right half
   links to the PDF page showing the whole spread, and every later link is still on the right page
   (Task 5, check 5.1).
3. **A stale stamped text** (the text no longer equals what its template resolves to now, e.g.
   `{date}` changed since the last edit): it gets no links and the export doesn't fail (Task 5,
   check 5.4).
4. **Bookmark titles with non-ASCII or PDF delimiters** ("Túneles", "Sección (2)", "a\\b", emoji):
   they show correctly, because titles are UTF-16BE hex strings (Task 1, check 1.2).
5. **CMYK/PDF/X export**: bookmarks are present, no `/Annots` are written, and the file stays PDF/X
   (Task 1, check 1.4).

---

## File tree

```
src/canvas/export/pdf/
  README.md                         modify  outline + links section
  pdf-text-string.ts                create  pdfTextString(): UTF-16BE hex text string
  pdf-outline.ts                    create  writeOutline(): /Outlines objects
  pdf-outline.types.ts              create  PdfOutlineItem
  pdf-links.ts                      create  linkAnnotations(): /Link dicts
  pdf-links.types.ts                create  PdfLink
  pdf-document.ts                   modify  addPage(…, links) → index, setOutline, pageRef, save
  export-pdf.ts                     modify  thread links through addPdfPage → doc.addPage
  svg-to-pdf.ts                     modify  addSvgPage passes links on
  pdf-book.ts                       modify  links on add(), world → page boxes, setOutline, PDF/X
  pdf-book.types.ts                 modify  PdfBookPage.links, PdfBookLink
  index.ts                          modify  export new types/functions
src/canvas/export/index.ts, src/canvas/index.ts   modify  re-export PdfOutlineItem, PdfBookLink

src/products/design/modules/catalog/
  README.md                         modify
  catalog.module.ts                 modify  textTemplates + PageRefSection contributions
  locales/en.json, locales/es.json  modify  items.pageRef*, checks.pageRefMissing, pageRef.*
  model/page-items/
    contents-entries.ts             create  contentsEntries(layout, numbers): ContentsEntry[]
    contents-entries.types.ts       create  ContentsEntry
    table-of-contents.ts            modify  formats ContentsEntry[] (signature changes)
    page-refs.ts                    create  pageRefs(layout, numbers): PageRefs
    page-refs.types.ts              create  PageRefTarget, PageRefs
    template-parts.ts               create  templateParts(): text + link ranges
    template-parts.types.ts         create  TemplateParts, TemplateLink
    resolve-template.ts             modify  = templateParts(…).text
    page-item.types.ts              modify  TemplateContext: contents, refs
    template-context.ts             create  brochureContext(record, layout, numbers)
    sync-page-items.ts              modify  uses brochureContext
    page-item-library.ts            modify  + page-ref item
    page-item-template-source.ts    create  CATALOG_TEXT_TEMPLATE (TextTemplateSource)
    page-ref-token.ts               create  readPageRef / withPageRef (template edits)
    index.ts                        modify
  checks/
    brochure-checks.types.ts        modify  + "page-ref-missing"
    brochure-checks.ts              modify  report unmatched refs
  export/
    side-pdf-pages.ts               create  sidePdfPages(layout, split): number[]
    text-side.ts                    create  textSide(el, frame, layout): side index | null
    range-boxes.ts                  create  rangeBoxes(layout, start, end): Rect[] (text-local)
    page-links.ts                   create  pageLinks(…): PdfBookLink[] for one printed page
    page-links.types.ts             create  PageLinksInput
    brochure-outline.ts             create  brochureOutline(entries, pdfPages): PdfOutlineItem[]
    printed-pages.ts                modify  + sides on each PrintedPage
    printed-pages.types.ts          modify  PrintedPage.sides
    export-brochure.ts              modify  wires links + outline
  mcp/add-page-item.ts              modify  + optional `target` for page-ref
  ui/design-mode/
    page-ref-section.tsx            create  "Points to" picker
    page-ref-section.types.ts       create
  ui/index.ts                       modify

CHANGELOG.md, CHANGELOG.es.md        modify  (Tasks 4 and 5)
docs/catalog-roadmap.md              modify  (Task 6)
```

---

### Task 1: Outlines and link annotations in the PDF writer

**Files:**

- Create: `src/canvas/export/pdf/pdf-text-string.ts`, `pdf-outline.ts`, `pdf-outline.types.ts`,
  `pdf-links.ts`, `pdf-links.types.ts`
- Modify: `src/canvas/export/pdf/pdf-document.ts`, `export-pdf.ts`, `svg-to-pdf.ts`,
  `pdf-book.ts`, `pdf-book.types.ts`, `index.ts`, `README.md`; `src/canvas/export/index.ts`,
  `src/canvas/index.ts` (re-exports)

**Interfaces:**

- Produces:
  - `pdfTextString(text: string): string`: `<FEFF…>`, UTF-16BE code units as hex (surrogate pairs
    as written by JS strings).
  - `interface PdfOutlineItem { title: string; page: number; children: readonly PdfOutlineItem[] }`
    (`page`: 0-based index of a page added to the document).
  - `interface PdfLink { box: PdfBox; page: number }` (box in the page's points; target page index).
  - `PdfDocument.addPage(layout, content, links?: readonly PdfLink[]): number`: returns the page's
    0-based index. `PdfDocument.setOutline(items: readonly PdfOutlineItem[]): void`.
  - `interface PdfBookLink { rect: Rect; page: number }` (rect in world units of the page's area).
  - `PdfBookPage.links?: readonly PdfBookLink[]`; `PdfBook.add(page): Promise<number>`,
    `PdfBook.addBlank(size): Promise<number>` (the PDF page index); `PdfBook.setOutline(items)`.

- [ ] **Step 1: `pdfTextString`** in `pdf-text-string.ts`.
- [ ] **Step 2: Links.** `linkAnnotations(links, pageRef: (index) => number | null): string[]`
      in `pdf-links.ts`. Each is
      `<< /Type /Annot /Subtype /Link /Rect [l b r t] /Border [0 0 0] /Dest [ref 0 R /XYZ null null null] >>`.
      A link whose target page doesn't exist is dropped. In `PdfDocument.addPage`, when `links` is
      non-empty, reserve one object for the page's `/Annots` array, put `/Annots N 0 R` in the page
      dict, and fill it in a `beforeSave` finisher, since targets may be pages added later. Add
      `pageRef(index: number): number | null`.
- [ ] **Step 3: Outline.** `writeOutline(doc: PdfDocument, items, pageRef): number | null` in
      `pdf-outline.ts` writes the `/Outlines` dictionary and one object per item (`/Title` via
      `pdfTextString`, `/Parent`, `/Prev`, `/Next`, `/First`, `/Last`, positive `/Count` = open
      descendants, so top-level items show expanded) with `/Dest` like links. Items whose page is
      missing are dropped along with their children. It returns `null` for an empty outline. In
      `PdfDocument.save()`, after the finishers and before the catalog, call it. When it returns a ref,
      the catalog gets `/Outlines N 0 R /PageMode /UseOutlines`.
- [ ] **Step 4: Thread links.** `addPdfPage(doc, host, page, background, options, output, links?)`
      → `addSvgPage(…, links)` and `addFlattened(…, links)` → `doc.addPage(layout, content, links)`.
- [ ] **Step 5: `PdfBook`.** In `add`, map each `PdfBookLink.rect` to a `PdfBox` with
      `pageMatrix(pdfPageLayout(rect, options), rect)` applied to its corners (min/max, since y flips),
      where `rect` is the page's `PdfBookPage.rect` (the trim; the print layout already accounts for
      bleed and marks). Pass no links at all when `this.options.print?.color` is set (PDF/X). Keep a page
      counter so `add`/`addBlank` return the index. `setOutline` stores the items for `doc.setOutline`.
- [ ] **Step 6: README.** In `src/canvas/export/pdf/README.md`, add a "Bookmarks and links" bullet:
      outline from `setOutline`, `/Link` annotations from `PdfBookPage.links` in world units, none in
      PDF/X, `/PageMode /UseOutlines`.
- [ ] **Step 7: Acceptance checks** (trace and report):
  - 1.1 A book with no `setOutline` call and no links writes byte-for-byte the same structure as
    before (no `/Outlines`, no `/Annots`).
  - 1.2 `pdfTextString("Sección (2) \\ 🦭")` is a hex string starting `FEFF`, with no unescaped `(`,
    `)` or `\` anywhere.
  - 1.3 A link to page 5 attached to page 0 resolves, because the annotations are filled at save.
  - 1.4 With `print.color` set, `/Outlines` is written and no `/Annots` key appears.
- [ ] **Step 8: Verify.** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: no errors.
- [ ] **Step 9: Commit.** `git commit -m "feat(pdf): outlines and page links"`

### Task 2: One list of contents entries, `{page:Name}`, and link ranges in templates

**Files:**

- Create: `model/page-items/contents-entries.ts`, `contents-entries.types.ts`, `page-refs.ts`,
  `page-refs.types.ts`, `template-parts.ts`, `template-parts.types.ts`, `template-context.ts`
- Modify: `model/page-items/table-of-contents.ts`, `resolve-template.ts`, `page-item.types.ts`,
  `sync-page-items.ts`, `copy-node.ts` and `plan-page-items.ts` (callers only), `index.ts`
  (all paths under `src/products/design/modules/catalog/`)

**Interfaces:**

- Consumes: `BookLayout`, `PageInfo` (existing).
- Produces:
  - `interface ContentsEntry { title: string; depth: number; label: string; side: number }`
    (`side`: index into `layout.sides` of the page it opens).
  - `contentsEntries(layout: BookLayout, numbers: readonly PageInfo[]): ContentsEntry[]`, the
    exact selection and order `tableOfContents` uses today (sections by `info.path`, depth = index in
    the path; else numbered pages by frame name; right halves skipped).
  - `tableOfContents(entries: readonly ContentsEntry[]): string`: the same text as before
    (`INDENT.repeat(depth) + title + LEADER + label`, joined with `\n`).
  - `interface PageRefTarget { label: string; side: number }`;
    `type PageRefs = (name: string) => PageRefTarget | null`;
    `pageRefs(layout, numbers): PageRefs`. It matches a section's name first (its first side), then
    a page frame's name (its first side), trimmed and case-insensitive, first in reading order.
  - `interface TemplateLink { start: number; end: number; side: number }`;
    `interface TemplateParts { text: string; links: TemplateLink[] }`;
    `templateParts(template: string, context: TemplateContext): TemplateParts`.
  - `TemplateContext` gains `contents: readonly ContentsEntry[]` and `refs: PageRefs`; `toc` stays
    (the formatted string).
  - `brochureContext(record: BrochureRecord, layout, numbers): Omit<TemplateContext, "info">`. It
    moves the context building out of `syncPageItems` (pages, title, date, toc, contents, refs), so
    the export builds exactly the same one.
  - `UNMATCHED_PAGE_REF = "??"`.

- [ ] **Step 1: `contentsEntries` + `tableOfContents(entries)`**, moving the selection loop out of
      `table-of-contents.ts` unchanged.
- [ ] **Step 2: `pageRefs`.**
- [ ] **Step 3: `templateParts`.** Extend the token regex with `\{page:([^}]*)\}` (an empty name is unmatched). The existing
      `(?::(all|\d+))?` option stays for `section`; `{page}` alone is unchanged. While replacing, keep
      the output offset. `{toc}` adds one `TemplateLink` per entry, covering that entry's line in the
      output (from its first character to the end of its label). `{page:Name}` writes the target's
      label, or `UNMATCHED_PAGE_REF` with no link, and adds a link over exactly what it wrote, when the
      label isn't empty. `resolveTemplate(template, context)` becomes `templateParts(…).text`.
- [ ] **Step 4: `brochureContext`**, and use it in `syncPageItems`.
- [ ] **Step 5: README.** Add `{page:Name}` to the tokens list and `contentsEntries` as the single
      source for `{toc}` (and, from Task 5, the outline) in the catalog README.
- [ ] **Step 6: Acceptance checks:**
  - 2.1 For any brochure, `tableOfContents(contentsEntries(l, n))` equals the old
    `tableOfContents(l, n)` output (same loop, same strings).
  - 2.2 `templateParts("Contents\n{toc}", ctx)`: link _i_'s `[start, end)` slices out
    `INDENT…title…LEADER…label` of entry _i_ from `text`.
  - 2.3 `templateParts("see page {page:specs}", ctx)` with a section "Specs" on label "12" gives
    `text` "see page 12" and one link `{ start: 9, end: 11 }`. With no match, it gives "see page ??"
    and no links.
  - 2.4 `{{page:x}` still writes `{page:x}` literally (the `{{` escape wins).
- [ ] **Step 7: Verify.** Run `pnpm lint && pnpm typecheck && pnpm format:check`.
- [ ] **Step 8: Commit.** `git commit -m "feat(catalog): contents entries and {page:Name} references"`

### Task 3: Check for references that point nowhere

**Files:**

- Modify: `checks/brochure-checks.types.ts`, `checks/brochure-checks.ts`, `locales/en.json`,
  `locales/es.json`, `README.md` (catalog)

**Interfaces:**

- Consumes: `pageItemTemplate`, `pageRefs` (Task 2).
- Produces: `BrochureIssueKind` gains `"page-ref-missing"`.

- [ ] **Step 1:** Next to the `toc-overflow` check, for each shown text with a template containing
      `{page:`, report one issue per unmatched name: `t("checks.pageRefMissing", { name: node.name,
target })`. en: "“{{name}}” refers to “{{target}}”, which isn't a section or page of this
      brochure." es: "«{{name}}» remite a «{{target}}», que no es una sección ni una página de este
      folleto." (Match the existing interpolation syntax in `locales/*.json`.)
- [ ] **Step 2: Acceptance check** 3.1: renaming the section a reference points to makes the check
      appear, and renaming it back clears it, with no other code path involved.
- [ ] **Step 3: Verify.** Run `pnpm lint && pnpm typecheck && pnpm format:check`.
- [ ] **Step 4: Commit.** `git commit -m "feat(catalog): check page references that point nowhere"`

### Task 4: The Page reference item, editable page-item templates, the target picker

**Files:**

- Create: `model/page-items/page-item-template-source.ts`, `model/page-items/page-ref-token.ts`,
  `ui/design-mode/page-ref-section.tsx`, `ui/design-mode/page-ref-section.types.ts`
- Modify: `model/page-items/page-item-library.ts`, `catalog.module.ts`, `ui/index.ts`,
  `mcp/add-page-item.ts`, `locales/en.json`, `locales/es.json`, `README.md`, `CHANGELOG.md`,
  `CHANGELOG.es.md`

**Interfaces:**

- Consumes: `TextTemplateSource`, `textTemplates` from `../text`; `pageRefs`, `contentsEntries`
  (Task 2).
- Produces:
  - `CATALOG_TEXT_TEMPLATE: TextTemplateSource` (`id: "catalog-text"`). It claims texts with
    `pageItemTemplate(el) !== null && pageItemTag(el) === null`, so master copies stay edited through
    their master. `read` returns `{ text: catalogText, runs: [] }`, `write` returns
    `{ catalogText: text }`. The sync re-resolves, and the existing "styled ranges dropped" rule
    applies.
  - `readPageRef(template: string): string | null` (first `{page:…}` name);
    `withPageRef(template: string, name: string): string` (replaces it, or appends ` {page:name}`).
  - `PAGE_ITEMS` gains `{ id: "page-ref", label: t("items.pageRef"), template:
t("items.pageRefTemplate"), anchor: "body", align: "outer", fontSize: 10 }`. en template:
    "see page {page:}", es: "ver página {page:}". An empty name is unmatched until picked, and the
    check from Task 3 says so.

- [ ] **Step 1:** Template source plus its `host.contribute(textTemplates, CATALOG_TEXT_TEMPLATE)` in
      `catalog.module.ts`. Confirm in the data module that `isCatalogText` keeps the data source from
      claiming these texts.
- [ ] **Step 2:** `page-ref` item and its locale keys. `{page:}` parses as a page-ref with an empty
      name (Task 2's regex) and resolves to `UNMATCHED_PAGE_REF`.
- [ ] **Step 3: `PageRefSection`**, a `designEditor.propertySections` entry shown for a single
      selected text whose template has a `{page:…}` and is not a copy. It holds one kit `SelectField`
      "Points to" (`t("pageRef.target")`) listing the open brochure's sections (indented by depth) then
      its pages by frame name. Choosing one writes `catalogText: withPageRef(template, name)` in one
      undo step (`doc.checkpoint()` first). Model it on `ui/design-mode/section-parents-section.tsx`.
- [ ] **Step 4: Agents.** `add_page_item` takes an optional `target` (string, a section or page
      name), used only with `item: "page-ref"` and rejected otherwise. It's validated against `pageRefs`
      before any write, and its description says so.
- [ ] **Step 5: README and changelog.** Catalog README: page reference item, editable templates,
      picker, `target`. Changelog under New, en: "Page items can now refer to another page: add a _Page
      reference_, pick the section or page it points to, and it keeps showing the right number as pages
      move. Double-clicking a page item now edits its wording, such as “Page {page} of {pages}”." Add the
      same in Spanish in `CHANGELOG.es.md` under Novedades.
- [ ] **Step 6: Acceptance checks:**
  - 4.1 Double-clicking an inserted "Page of" item opens the editor on "Page {page} of {pages}", and
    after commit the canvas shows the resolved text again.
  - 4.2 A master copy (`catalogCopy` set) is not claimed, so its editing is unchanged.
- [ ] **Step 7: Verify.** Run `pnpm lint && pnpm typecheck && pnpm format:check`.
- [ ] **Step 8: Commit.** `git commit -m "feat(catalog): page reference item and editable page-item templates"`

### Task 5: Bookmarks and links in the brochure export

**Files:**

- Create: `export/side-pdf-pages.ts`, `export/text-side.ts`, `export/range-boxes.ts`,
  `export/page-links.ts`, `export/page-links.types.ts`, `export/brochure-outline.ts`
- Modify: `export/printed-pages.ts`, `export/printed-pages.types.ts`, `export/export-brochure.ts`,
  `README.md` (catalog), `CHANGELOG.md`, `CHANGELOG.es.md`

**Interfaces:**

- Consumes: `PdfBookLink`, `PdfOutlineItem`, `PdfBook.setOutline` (Task 1); `contentsEntries`,
  `templateParts`, `brochureContext` (Task 2); `textLayout`, `isText` from `../../text`;
  `pageItemTemplate`, `pageItemTag`, `pageNumbers`, `shownNodes` (existing).
- Produces:
  - `PrintedPage` (`kind: "frame"` and `"blank"`) gains `sides: readonly number[]`, the layout side
    indexes it shows (two for an unsplit spread).
  - `sidePdfPages(printed: readonly PrintedPage[], sideCount: number): number[]`: side index → PDF
    page index.
  - `textSide(el: TextNodeElement, frame: FrameElement, sides: readonly number[], layout: BookLayout): number | null`.
    With one side, that side. With two, `pageItemTag(el)?.half` when tagged, else the same middle
    rule `planPageItems` uses (`el.x + el.w / 2 < frame.x + frame.w / 2` → the left side).
  - `rangeBoxes(layout: RichTextLayout, start: number, end: number): Rect[]`: per line, the union
    of fragments overlapping `[start, end)` (non-space), in text-local units (`line.top`,
    `line.height`). For TOC entries, `pageLinks` widens each box to the text box's full width.
  - `pageLinks(input: PageLinksInput): PdfBookLink[]`, where `PageLinksInput { page: PrintedPage &
{ kind: "frame" }; elements: readonly CanvasElement[]; layout: BookLayout; numbers: readonly
PageInfo[]; context: Omit<TemplateContext, "info">; pdfPages: readonly number[] }`.
  - `brochureOutline(entries: readonly ContentsEntry[], pdfPages: readonly number[]): PdfOutlineItem[]`:
    nests by `depth` (an entry is a child of the last shallower one before it).

- [ ] **Step 1: `sides` on printed pages** and `sidePdfPages`.
- [ ] **Step 2: `textSide` and `rangeBoxes`.**
- [ ] **Step 3: `pageLinks`.** For each `shownNodes(frame.id, elements)` text with
      `rotation === 0`, a template holding `{toc}` or `{page:`, and a side: build the context with that
      side's `numbers[side]`, then `templateParts(template, ctx)`. When `parts.text !== el.text`, skip
      it (stale). Otherwise, for each link, `rangeBoxes(textLayout(el), start, end)`. TOC links span the
      text's width. Offset each box by `el.x`/`el.y` into world units, clip it to the printed part's
      rect (`partRect(frame, part)`), and target `pdfPages[link.side]`.
- [ ] **Step 4: `brochureOutline`.**
- [ ] **Step 5: Wire `exportBrochure`.** Compute `numbers = pageNumbers(layout, record)` and
      `context = brochureContext(…)` once, then `pdfPages`. Pass `links: pageLinks(…)` to `book.add` for
      frame pages. Before `book.save()`, call
      `book.setOutline(brochureOutline(context.contents, pdfPages))`. It needs the brochure record, so
      use `DesignBrochure`'s accessor for it or add a `record()` getter there.
- [ ] **Step 6: README and changelog.** Catalog README export bullet: outline mirrors the table of
      contents, TOC lines and page references link in the PDF, none in PDF/X, stale or rotated texts get
      no links. Changelog under New, en: "Exported brochures now open with bookmarks in the PDF reader's
      sidebar, following your sections, and every line of the table of contents and every page reference
      takes you to its page. Print files in CMYK keep the bookmarks." Add the same in Spanish in
      `CHANGELOG.es.md` under Novedades.
- [ ] **Step 7: Acceptance checks** (Review Focus):
  - 5.1 `splitSpreads: false`: a section starting on a spread's right side maps to that spread's PDF
    page, and the page after the spread maps to the next PDF page.
  - 5.2 With no sections, the outline has one flat item per numbered page, in TOC order.
  - 5.3 A TOC entry wider than its box wraps, and both of its layout lines get a box pointing to the
    same page.
  - 5.4 A text whose stamped `text` differs from `templateParts(…).text` yields no links and no
    throw.
  - 5.5 The flattened mode receives the same links (they're computed before `book.add`, independent
    of `pdfMode` and of `text: "selectable"`).
- [ ] **Step 8: Verify.** Run `pnpm lint && pnpm typecheck && pnpm format:check`.
- [ ] **Step 9: Commit.** `git commit -m "feat(catalog): bookmarks and page links in brochure PDFs"`

### Task 6: Roadmap

**Files:** Modify `docs/catalog-roadmap.md`.

- [ ] **Step 1:** Under C3, tick Decide, set the priority to `P1`, and add under **Notes**:
      "Shipped: bookmarks, clickable table of contents, page references. Web links are left to the
      editor's linking plan."
- [ ] **Step 2:** Run `pnpm format:check`, then commit: `git commit -m "docs: C3 shipped in the catalog roadmap"`
