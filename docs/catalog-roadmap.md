# Catalog mode roadmap

Ideas for the Catalog mode: what to add, improve or change. Edit freely. Tick `[x]` what we'll do,
cross out what we won't, and write under **Notes** for anything to add or change. The ids (C1, C2,
…) are so we can refer to items in conversation.

**Priority:** `P1` soon, `P2` next, `P3` later, `—` undecided.

---

## Top picks

### C1. Text in several languages on the same layout

- [ ] Decide · Priority: —

Today a Spanish and a French brochure share the same frames, so they share the same text. With
this, a text layer holds one version per language and the brochure's language picks which one
shows. You design once and translate in place, and both brochures export from the same pages.

It also fixes duplicated masters: today, changing one brochure's language rewrites the master
frames both brochures share.

This is the largest item: the text model, editing, a translation view, and agent tools to fill in
translations.

**Notes:**

### C2. A catalog built from data (data merge)

- [ ] Decide · Priority: —

You design one product card (photo, name, code, price, specs), link it to a CSV, JSON or
spreadsheet, and the app fills as many pages as it needs. Updating the file updates the pages.
This is how product catalogs are usually made, and nothing else here saves as much time.

Open questions: which file types, images by file name or URL, one card per page or a grid, and
what happens to pages edited by hand after the data changes.

**Notes:**
i was thinking, that have antoher tab, cuz now only has "brochure", we could add a new one that is source (or a btter name) so can select all the sources and add new ones, from api, from file csv, json, excel, so we need to add a parser for it.
that ways shows all and can use it, and personalize a bit, cuz otherwise could like like "{my_uploaded_file_extrange.data.sfdf.dfd.f.name.[$index].data}" we could personalize like "{products.[$index].name}"
so that way we can reuse it in the brochure correctly, and declare what value is? text, intener, ... imageUrl, Image Base64.?... etc

### C3. Bookmarks and links in the PDF

- [ ] Decide · Priority: —

- Sections become the PDF's bookmarks (the sidebar outline in a PDF reader), nested like the
  folders.
- The table of contents is clickable.
- A `{page:Name}` token writes cross-references like "see page 12" that update when pages move.
- Web links in text are clickable.

**Notes:**
yes, this i like it, and how we have the table of content can work togheter smoothly

### C4. Booklet printing

- [ ] Decide · Priority: —

- A warning when the page count isn't a multiple of 4, with a one-click "Add blank pages".
- Export as _printer spreads_ (pages 16 and 1 on one sheet, 2 and 15 on the next, …) to print a
  saddle-stitched booklet on an office printer.

**Notes:**

---

## Improvements to what exists

### C5. Page numbers

- [ ] Decide · Priority: —

- [ ] Zero-padding ("06")
      lets included

- [ ] A prefix or suffix ("A-3")
      lets included
- [ ] Numbers that include the section ("2.3")
      lets include it

**Notes:**

### C6. Better checks before printing

- [ ] Decide · Priority: —

- [ ] Text that doesn't fit its box
- [ ] Missing fonts
- [ ] Text too small to print well
- [ ] RGB images in a CMYK export
- [ ] Layers inside the margin
- [ ] Empty frames left on pages
- [ ] Low contrast
- [ ] A **Fix** button where a fix is obvious

**Notes:**

### C7. Margins and grids

- [ ] Decide · Priority: —

- [ ] Inner and outer margins instead of one value, mirrored on facing pages
- [ ] Columns per master
- [ ] A baseline grid
- [ ] The bleed and the safe area shown on the canvas

**Notes:**

### C8. Masters based on masters

- [ ] Decide · Priority: —

A "B-Master" takes everything from "A-Master" and changes only, say, the header. Today every
master stands alone.

**Notes:**

### C9. Page items that follow the design system

- [ ] Decide · Priority: —

Page numbers and running heads are linked to a text style and a color variable, so restyling
every header is a single edit.

**Notes:**

### C10. More export options

- [ ] Decide · Priority: —

- [ ] A page range, or a single section
- [ ] A quick low-resolution proof PDF next to the print PDF
- [ ] PNG or JPG of each page (social media, a website)
- [ ] All of a page's brochures (e.g. Spanish and French) in one go

**Notes:**

---

## New ideas

### C11. A flipbook web export

- [ ] Decide · Priority: —

The 3D preview with its page turns, saved as one HTML file you can send a client or put online.
The board already has an HTML export to build on.

**Notes:**

### C12. Review status per page

- [ ] Decide · Priority: —

A draft, in-review or approved mark on each page, plus notes for the client, with a filter in the
pages list ("show only pages not approved").

**Notes:**

### C13. A links panel

- [ ] Decide · Priority: —

Every image in the brochure with its resolution at print size, where it's used, and Replace or
Relink. It turns the "low dpi" check into one place to fix them.

**Notes:**

### C14. Find and replace across the brochure

- [ ] Decide · Priority: —

With a spell check in the brochure's language.

**Notes:**

### C15. A spreads view in the Pages panel

- [ ] Decide · Priority: —

Thumbnails side by side as they're read, as a toggle next to the list. It's quicker for checking
how pages work together.

**Notes:**

---

## Small fixes already found

- [ ] **F1.** Duplicating a design page doesn't copy its brochures.
- [ ] **F2.** `{date}` only updates the next time a page is edited.
- [ ] **F3.** Test page items on FLBC's page 7 overlap the master's page number (file content, not
      code).

**Notes:**

---

## Suggested order

1. C3 (PDF bookmarks and links) and C4 (booklet printing): quick to build, visible to clients.
2. C5 (page numbers) and C6 (checks).
3. C1 (languages), as its own project.
4. C2 (data merge).

**Your order / changes:**

---

## Your own ideas

Add anything here; I'll give it an id when we plan it.

-
