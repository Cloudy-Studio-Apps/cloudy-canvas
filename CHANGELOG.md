# Changelog

What changes in each version of Cloudy Canvas. The Spanish translation is in
[CHANGELOG.es.md](CHANGELOG.es.md).

## Unreleased

### New

- The database schema now exports as Java too: plain classes with a field per column and the
  related objects and lists, or JPA entities for Spring Boot 4 with only the annotations Spring
  doesn't already assume. Both are written to copy from, without packages or imports.
- Selecting a frame, a group, a vector or several layers now shows a Selection colors section in
  the properties panel with every color used inside them. Change a color there and it updates
  everywhere it's used at once, or select the layers that use it, without opening each layer.
- Each closed area of a vector can now have its own fill: in vector edit mode, click
  inside an area to select it and change its fill in the Fills section. An area's fill can use a
  color style or variables, show data, and edit its gradient on the canvas, and its colors appear
  in the page's colors and the color wizard. Imported .fig files keep the colors of multi-colored vectors
  such as logos and icons, as one editable vector.
- SVG files pasted or dropped into a design now become one editable vector: each
  shape of the file is an area with its own color, gradient or outline, instead of a flat picture.
  Converting a sticker to vectors works the same way, giving one vector you can recolor area by
  area.
- Designs can now hold data sources, such as a CSV or JSON file or a web API: the new Data tab lists
  them with their rows, and Update reads them again whenever you choose. API keys stay on this
  device and are never saved in the file, and a key is only sent to the site it was typed for. A
  file's location stays on this device too, so on another computer you pick the file once there.
- Pictures named in a data source, as image links, embedded images or file names in a folder you
  choose, are saved in the design when you update it, so they keep showing offline and on other
  computers. The Data tab shows the download's progress and how many pictures couldn't be saved.
- Texts, images and colors can now show data from a source: write a field's name in braces, such as
  {products[0].name}, or bind a layer's image, color, size or opacity in the new Data section of
  the properties panel. Numbers, prices and dates are written in your language, a layer can show
  only when a field meets a condition, and a layer can hide while its value is empty.
- Select a card inside a frame and choose Repeat this layer to show it once for each row of a list,
  such as one card per product, lined up by the frame and filtered, sorted and capped as you choose
  in the new Repeat section. The copies follow the card you design and update with the data, and
  any copy can be detached to edit it on its own.
- The Data tab now points out data that doesn't fit: fields a layer reads that no longer exist,
  texts too long for their box, pictures that couldn't be saved, sources that failed or were never
  updated, and lists that would make too many or stacked copies. Each source shows its count, and
  Select takes you to the layer.
- A web link's connection is now edited in a Connection dialog that says in plain words what will
  be sent. The options at the end of the link become rows, signing in takes an API key, a token or
  a username and password without writing headers by hand, common headers are offered with what
  each is for, and a POST can send a form, JSON built from rows or written by hand, or text. Try it
  shows the rows the link gives before you save.
- Data that holds its rows inside an object, such as an API's products list, now shows where the
  rows come from and lets you pick another list. Fields inside groups, such as a product's
  dimensions, are shown as a tree with an icon for each kind, and a list in each row, such as its
  tags or images, can show all its items, only the first or how many there are.
- Page items can now point to another page: add a Page reference, pick the section or page it points
  to, and it keeps showing the right number as pages move, such as "see page 12". Double-clicking a
  page item now edits its wording, such as "Page {page} of {pages}", instead of the number it
  shows.
- Brochure sections can now repeat for each row of your data: design a product's pages once (a cover,
  a description, a gallery that grows with its photos) and the brochure makes them for every
  product. Repeats nest, so categories can hold their products. While you design only the first few
  copies are made, but page numbers and the table of contents already count them all, and the
  export makes every page; it asks whether to update the data first.
- Exported brochures now open with bookmarks in the PDF reader's sidebar that follow your sections,
  and every line of the table of contents and every page reference takes you to its page. Print
  files in CMYK keep the bookmarks.
- Data sources can now read Excel files and APIs that return their rows in pages, and an optional step can pick and rename fields before they're used. Plugins can add their own kinds of source.

### Improved

- Frames now work as in other design tools: dragging on the background of a frame that holds
  layers draws a selection box to pick the layers inside, and the frame itself is selected by its
  name. Dragging inside a selected frame moves it, even when you press on a layer in it, and a
  click without dragging still selects that layer. Enter selects the layers inside what's
  selected and Shift+Enter selects the layer that holds it, so you can move between levels without
  the Layers panel.

- The database schema and ER diagram text editors now show their errors, warnings and suggestions
  in Spanish when the app is in Spanish. The language keywords you write, such as Table, Entity or
  Relation, stay the same in every language.
- Importing a .fig or .jam file now shows its progress and the list of what couldn't be brought
  over as it was in Spanish when the app is in Spanish.

### Fixed

- Exporting a page that isn't the one on screen, including exports made by an AI agent, now keeps
  its layers in the right order and draws its masks and effects as the canvas shows them.

## 0.8.0 - 2026-11-04

### New

- On touch screens, pinch with two fingers to zoom the canvas and drag with two fingers to move it,
  with any tool selected.
- Brochures can have masters: a header and footer designed once, with a frame for left pages and
  one for right pages, and repeated on every page that uses it. Text on a master can show the page
  number, the page count, the brochure's title, the section and the date, and each page picks its
  master or none. In the Design mode, master layers are locked and marked so every page stays the
  same, and Detach makes one editable on a single page. Duplicating a brochure keeps its masters.
- Brochures can be split into sections and subsections, as many levels deep as you need. In the
  Catalog mode's pages list each section is a folder over its pages: fold it away, drag it to move
  the whole section, drop pages on it, and right-click it to add a page or a subsection, move it a
  level in or out, rename or remove it. Numbering can restart or switch to roman numerals at a
  section, with covers counted, hidden or left out.
- A header can show the section's name alone or with the sections it's in, such as "Tunnels ›
  Shotcrete".
- A list of ready-made page items (page number, "Page 3 of 24", title, section, date and table of
  contents) can be clicked or dragged onto a master or a page, already placed in its margin.
- The table of contents item lists the brochure's sections, with subsections indented, or its
  pages, with their page numbers, and updates when pages move. The checks warn when it runs past
  its page's bottom margin.
- Each brochure has its own language, so one design can hold a Spanish and a French version of
  the same catalog. Dates, page items and the PDF follow it, and changing it rewrites the headers
  and footers already placed, unless you edited their text. Every brochure on a page keeps its own
  headers and footers.
- In the Catalog mode, the pages list has a menu to add a blank page or a new section: from the
  "+" button, by right-clicking the list, or by right-clicking a page to add them right after it.

### Improved

- In the Catalog mode, Delete is now labelled "Take out of the brochure", as it keeps the frame on
  the canvas. The new "Delete page and frame" (Shift+Delete) removes the frame from the design too,
  in one undo step, unless another brochure on the page still prints it.
- In a brochure's page list, Ctrl (⌘ on a Mac) + click and Shift + click select several pages,
  which you can then drag together, and Alt+↑/↓ moves the selected pages one place up or down.
- In the design editor, the people and agents working on the file now show as a column of avatars
  in the left rail, above the Agents button, so the top of the properties panel stays tidy however
  many join.

### Fixed

- Fast pen strokes no longer fill in as solid black shapes at sharp turns, and they follow your hand
  more closely.
- In a brochure's page list, pages can now be dropped on a blank page to take its place, on a
  spread's heading to start that spread (or on "Back cover" to make it the back cover), and below
  the last page to move it to the end. Dropping the back cover on the blank page added before it
  makes it a normal last page, without a back cover. Before, dropping a page there did nothing.

## 0.7.0 - 2026-11-01

### New

- ER diagrams have new menus built around pictures. Instead of dropdowns and codes like (0,n), you
  pick how many with dots, see each option as it's drawn, and watch what it does to the tables: click
  a row and a line shows the key your relation adds, and where it goes. Click any shape named in a
  menu to select it, and use the back button to return.
- Animated GIFs now play on boards and designs, including in image fills, crops and tiles, and in
  boards exported as HTML. Add them by dropping the file or choosing it from the image picker, as a
  GIF pasted from another app arrives as a still picture. They pause while off screen, and you can
  turn them off in Settings › Appearance.
- Export boards and designs as SVG, for the selection or the whole page. Shapes stay vector, so they
  are sharp at any size and can be edited in other design tools, and you choose whether text becomes
  outlines that look the same everywhere or stays editable.
- Export images as WebP, which keeps transparency and gives smaller files than PNG, on boards and
  designs and in a layer's export rows.
- PDF exports now stay sharp at any zoom and in print, with text you can search and copy. A new set
  of options lets you keep the old picture-style PDF, turn text into outlines, and choose image
  quality, resolution, paper size, orientation and margins.
- Save export settings on layers in Design: add rows with a size, a name suffix and a file type, then
  export them all with one click into a folder or a ZIP. They stay in the file, so you can make the
  same files again after any change.
- Frame selection in Design: Ctrl+Alt+G, or the option next to Group selection, wraps the selected
  layers in a new frame around them, without changing how they look.
- Export a PDF with one page per section on a board, or per top-level frame in a design, so large
  files stay readable. Anything outside them goes on a last page.
- Choose whether a frame's fill appears in exports: turn off Show in exports under Fills and the
  frame keeps its fill on the canvas, while exported files leave it out.
- Put your diagrams in Markdown files: export an ER diagram or a database schema as a Mermaid block
  and paste it into a README, wiki or note. ER diagrams keep their entities, relations and attributes,
  and GitHub, GitLab, Notion and Obsidian draw them for you. Find it in the ER mode's toolbar and in
  Export code.
- Choose what to export from a design's variables: a new dialog, in the Variables window and in
  Design system, lets you pick the format, tick the collections, groups or styles to include, preview
  the file, then copy or save it. Anything the ticked variables depend on comes along, so the file
  keeps working.
- Copy as SVG: copy your selection on a board or in a design as SVG code, from the right-click menu,
  and paste it straight into your code or into other design tools.
- Export all in Design: from the main menu, export every frame of a page or the whole file into a
  folder or a ZIP. Layers with their own export settings use them, and the rest use the default you
  choose. With all pages, each page gets its own folder.
- Brochures are now ready to trim: PDFs include bleed and crop marks, with the page boxes print shops
  expect, and layers placed past the page edge run into the bleed. Set the bleed or turn the marks off
  in the Print section of the Catalog panel.
- Export brochures in true CMYK: load your print shop's .icc profile in the Print section, and text,
  shapes, gradients and pictures are converted with it, while pure black text prints on black ink
  alone. The profile stays in the file, so the same brochure can be exported again at any time.
- CMYK brochures now export as PDF/X for print shops: PDF/X-4 from the Sharp PDF type, and PDF/X-1a
  from Image, each with the print profile inside. The checks warn when a CMYK brochure has no profile
  and when a layer stops exactly at the page edge, and Show margins also draws the bleed.

### Improved

- The app now shows a splash screen with the foca watona while it starts, instead of an empty
  window.
- The app starts much faster: Home opens first, and boards and designs load behind it, so they are
  ready by the time you open one. If you use plugins, they still load before Home appears.
- An agent's cursor and selection now fade away a few seconds after it stops working, so they don't
  get in the way of what you're doing. They come back as soon as it starts again.
- PDFs of brochures and design systems are now sharp at any zoom, with text you can search and copy.
  Brochures have a PDF type setting for print shops that ask for flat image pages.
- Opening a design that uses a font this computer doesn't have now tells you which fonts are
  missing, so text that shifts doesn't come as a surprise.

### Fixed

- In ER diagrams, a hierarchy's lines to its children now start at the tip of the triangle, so they no
  longer cut across it, and the exclusive arc grows to cover every line as you move the children.
- Copy as PNG now copies exactly what you selected, without an empty margin around it.
- Frame titles no longer appear in exported images, PDFs, SVGs or copies.
- In Design system, clicking an empty part of the canvas now clears the section from the side panel
  and brings back the overview, with the export buttons.
- Text in sharp PDFs can now always be searched and copied. Lines with characters such as €, curly
  quotes, Greek, Cyrillic, Japanese or emoji used to be left out.
- Keyboard shortcuts now work on keyboards where a key needs AltGr or Option, such as the layer
  order shortcuts [ and ] on Spanish keyboards on Windows and macOS. Unlock All also works on macOS.
- On Windows, F5, Ctrl+R and the right-click Refresh no longer reload the app and lose unsaved
  changes, and print or find shortcuts no longer open browser windows.
- Files dropped on the canvas now land where you drop them on Retina Macs and high-resolution Linux
  screens.
- On macOS, Cmd+Q now asks about unsaved changes and finishes saving before the app quits.
- Pinching on a Mac trackpad now zooms the canvas at the pointer.
- Reordering pages, brochure pages and style guide categories by dragging now works on Windows and
  macOS, and long lists scroll while you drag.
- Reordering effects and moving variable modes between groups by dragging now works on Windows and
  macOS.
- Dropping a picture on the color wizard now works in the desktop app.
- The canvas stays sharp when you move the window to a screen with different scaling.
- Saving no longer fails when antivirus or a sync app such as OneDrive briefly holds the file.
- On Ubuntu and Debian, board and design files are now recognized and open in Cloudy Canvas with a
  double click. Macs set to Spanish now open the app in Spanish.
- Exporting layers named like Windows system files, such as CON, no longer fails, and the macOS font
  picker no longer lists hidden system fonts.
- The canvas now comes back by itself after the graphics driver resets, for example after waking
  from sleep.

## 0.6.0 - 2026-10-29

### New

- Export a board as HTML and send it to anyone: it's a single file that opens in their browser with
  nothing to install. They can move around and zoom in as sharply as in the app and open the code of
  each table or ER diagram, but they can't change anything.
- Export your database schema as code for Laravel, Angular, NestJS (Prisma or TypeORM), MySQL,
  PostgreSQL or MongoDB, choosing the version you use. You get the models, migrations, entities or
  scripts written the way that framework expects: one table as its model, or the whole schema as a
  folder ready to drop into your project.

### Fixed

- The About window no longer shows its text over the seals video: the video sits on its own at the
  top, with the version, license and credits below it.

## 0.5.0 - 2026-10-27

### New

- Cloudy Canvas is now available in Spanish. The language follows your system, or you can choose
  it in Settings > Language and restart right away to apply it. New boards, designs and layers are
  named in the language of whoever creates them.
- A redesigned Home: pick up your last file from the Continue card, create a board, a design or a
  catalog in one click, and browse recent files in a grid or a list, filtered by kind and searchable
  by name, title or description.
- Start from a ready-made template on Home: ER diagram, database schema, retrospective, mobile app,
  desktop landing page or A4 brochure.
- If something goes wrong, the app now shows a clear error page with buttons to reload, go back
  Home or copy an error code to share when reporting the problem.
- See what changed in each version: a new version's changes are shown before you update, the app
  tells you once after it updates, and the full history is under Changelog in About and Settings.

### Improved

- Themes in Settings > Appearance are grouped by family, with a Light/Dark switch on each card, so
  finding the variant you want is quicker.
- The welcome screen shown before you have any recent files now has an Open file button, so you
  can open a board, a design or a Figma file without knowing the shortcut or dragging it in.

### Fixed

- A plugin that can't be loaded, such as one whose linked folder was deleted, now shows the reason
  in Settings and can be removed from there.
