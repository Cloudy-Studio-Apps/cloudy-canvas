# Sample products source

A plugin that adds a **data source type** to Designs, in plain JavaScript with no build step.
Add the folder in Settings › Plugins, turn it on and reload. In a design's Data tab, **+ Add
source** then lists "Sample products".

- `plugin.json`: the manifest; `products: ["design"]`, so `activate` returns one module.
- `main.js`: gets the data module with `host.require("data")` (a core module, so no `requires`)
  and contributes a `DataSourceType` to its `dataSourceTypes`: an `id`, a `label`, a lucide
  `icon` name, `settings` (here a `count` number; the Data tab draws the form from them),
  `defaultName` and `update(settings, ctx)`, which returns the data as the source got it. Here
  that is JSON text (`{ text, mime }`), which the JSON format parses into rows; `count` unset
  reads as 24.
- Each product is `{ id, name, price, category, image }`; `image` is a small SVG `data:` URL, so
  nothing is fetched and it works offline. Bind `image` to a picture fill and the rest to texts.
- `locales/`: its text in English and Spanish.

If the plugin is later removed, its sources keep their saved rows and fields (bindings and
repeats keep working); they say "Its plugin isn't installed" and can't be updated.
