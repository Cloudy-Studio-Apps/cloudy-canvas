# Color wizard

A dialog that sets up a design system from colors: build a palette (a color wheel with harmonies,
brand colors to keep, an image, the colors the file's layers already use, a gallery, or pasted
tokens), name each color's role, pick a Light/Dark theme on live previews, add text styles, review
the result on sample designs with contrast fixes, then write it all as one undo step.

- **Tier:** feature
- **Requires:** core, pages, text, variables, styleguide
- **Contributes:** designEditor: `overlays` (the dialog), `sessionHooks` (its command), `mainMenu`
  ("Color wizard…"); designCanvas: `hostCommands` (`openColorWizard`); `styleguideStartActions`
  (the Design system empty state's "Color wizard"); `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `run_color_wizard`
- **Files:** `color/` (conversions, OKLab distance, color-vision simulation, seeded random),
  `harmony/`, `sources/` (image colors, the file's fills and images, pasted palettes),
  `gallery/` (categories and their recipes), `theme/` (roles, added colors, the Theme, contrast
  checks and fixes, look-alike warnings), `type/`, `plan/` (what gets written, and writing it),
  `color-wizard.mcp.ts`, `ui/` (the dialog; `store/` is its session state).
- **Not yet:** running it again on a file that has the type scale changes the styles' fonts but
  not the scale's base or ratio (edit those in the Variables window).

## How it works

### The five steps (`ui/`)

The dialog (`ColorWizard`, kit `Dialog`) shows `WizardHeader` (the steps; earlier ones can be
revisited), the step, and `WizardFooter` (Back, Next, and on the last step `CreateButton`, which
says what it writes). Its state is `useColorWizardStore` (session only, private to the module);
`openColorWizard()` opens it. Opening on a file whose palette shade generators made starts from
it (`useExistingPalette`, `existingPalette`), so running it again edits the system in place.

1. **Colors** (`colors/`): six sources on the left, the palette on the right (`PalettePanel`:
   undo and redo of the wizard's own history, 2–8 colors, sort, a color-vision preview,
   Generate random or Space; each color can be locked, copied, edited with `ColorPopover`,
   removed, and a "+" on the seam between two adds the color halfway between them in OKLab).
   - **Wheel:** a base color (`ColorField`), brightness (`ColorSlider`) and a harmony
     (`ChoiceCards`); dragging the base handle moves the harmony, in Custom each handle moves alone.
   - **Brand:** up to three colors to keep, locked and named primary, secondary, accent; the rest
     from a harmony around the first (`buildFromBrand`).
   - **Image:** the file's image fills (`collectImages`), or one chosen, dropped or pasted (kept
     out of the file). `extractImageColors` (seeded k-means in OKLab on a ~96 px copy, weighted by
     the mood) gives each color a pin; dragging a pin samples the spot under it.
   - **This file:** the solid colors layers paint without a variable (`collectFills`, not on pages
     a feature keeps), near-duplicates merged (`mergeFills`, by OKLab distance); the colors keep
     their paints so Create can bind them.
   - **Gallery:** palettes generated per category from OKLCH recipes (`gallery/`), seeded by the
     category so they're stable, 15 more per "Generate more"; saved ones are app state
     (`usePaletteFavoritesStore`).
   - **Import:** `parsePalette` reads a Coolors link, JSON tokens (DTCG `$value` too), CSS custom
     properties, or any hex, `rgb()`, `hsl()` or `oklch()`; names become roles.
2. **Roles & shades** (`roles/`): each color's role (its variable group; `defaultRoleNames`
   picks primary, secondary, accent… by chroma and a gray as `neutral`), whether it's included,
   its shades; options add a neutral tinted with the primary's hue and status colors nudged
   toward it (`wizardColors`). Groups the file has already are marked "updates".
3. **Theme** (`theme/`): whether to make the Theme collection and its modes, in two views.
   **Visual** draws a page per mode whose parts (`ThemePart`) carry their token: hovering
   outlines every part using it and names it, clicking selects it. **List** shows every token
   per mode. `ThemeStrip` picks the selected token's color: Automatic (the default), Contrast
   (white or black, for `primary-foreground`), White, the shades of any palette role, Black, or a
   Custom color; ✓ marks choices that pass every rule the token is in (`candidatePasses`). Choices
   are `overrides` (token → mode → `{ role, stop, hex }`); Mirror copies one to the other mode.
4. **Type** (`type/`): font pairs, the heading and body fonts (the text module's `FontPicker`), a
   ratio and the body size; samples in the theme's text colors. `usePreviewFonts` loads the faces.
5. **Review** (`review/`): every variable and text style Create writes (`useWizardPlan`), five
   sample designs in either mode (`previews/`: website, components, social media, brochure,
   mobile app), contrast checks with Fix and Fix all, and look-alike warnings. Done shows the
   `CelebratingSeal` and a `Confetti` burst in the palette's colors.

### The Theme (`theme/`)

`THEME_SPEC` lists the tokens (background, surface, border, foreground, muted-foreground,
primary, primary-foreground, primary-soft, accent, success, warning, error, info), the role each
reads and its default shade per mode. `buildTheme` resolves them with the user's choices;
tokens whose role is missing are left out. `CONTRAST_RULES` are the pairs that must stay
readable; `fixContrast` moves a token to the nearest shade that passes every rule it's in.
`cvdWarnings` reports role pairs that look alike to everyone or under protanopia, deuteranopia
or tritanopia.

### Writing (`plan/`)

`applyWizard(doc, tokens, input)` checks the input (`checkWizardInput`) and writes, in one undo
step (`asUndoStep`):

- **The palette** (`writePalette`): each color's 50–950 shades as a shade generator in the
  palette's collection (`DocumentTokens.saveGenerator`, the color at 500, `other: "same"`), so
  editing the color later regenerates them; an existing generator for the group is updated.
  Without shades, one variable per color.
- **The Theme** (`writeTheme`): a "Theme" collection, the "Theme" mode axis when there are two
  modes, a variable per token aliasing its shade in each mode (or the color itself for white,
  black, custom and automatic ones), and its contrast pairs declared (`contrastWith`) so the
  variables' contrast checks know them.
- **Text styles** (`writeType`): the variables module's `createTypeScale` in a "Typography"
  collection, then the headings set in their font.
- **Bindings:** the collected paints bound to their color's 500.

`buildWizardPlan` gives the same without writing, for the review and agents' previews.

### Agents

`run_color_wizard` takes the colors as `{ role, hex }`, the options, the modes, Theme overrides
and text styles; it fixes contrast by default and returns the contrast results and look-alike
pairs with what it wrote, or only the plan with `preview: true`.
