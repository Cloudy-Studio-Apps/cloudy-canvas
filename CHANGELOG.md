# Changelog

What changes in each version of Cloudy Canvas. The Spanish translation is in
[CHANGELOG.es.md](CHANGELOG.es.md).

## Unreleased

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
