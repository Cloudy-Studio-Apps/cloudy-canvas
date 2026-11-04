# Prototypes

Single-file HTML mockups of a proposal, shown to the user before any real code is written. They
open in a browser with a double-click: no build, no React, no install.

## Starting one

Copy the template of the product the proposal is for, and name the copy after the feature:

| Product                                         | Template                                         |
| ----------------------------------------------- | ------------------------------------------------ |
| Design (`.cdesign`, Figma-style, `/design/:id`) | [`_design-template.html`](_design-template.html) |
| Board (`.cboard`, FigJam-style, `/board/:id`)   | [`_board-template.html`](_board-template.html)   |

```sh
cp docs/prototype/_design-template.html docs/prototype/<feature-name>.html
```

Then follow the header comment at the top of the file, and search the file for `AGENT:`: each
`AGENT: ADD …` block says what goes there (a properties section, a left panel tab, a toolbar tool,
a menu, a dialog, canvas content, extra CSS or JS).

## What the templates hold

- **Tokens**: the palette, shape, density and elevation from `src/shared/ui/styles/tokens.css`, and
  the semantic tokens of the Cloudy Light and Cloudy Dark themes
  (`src/shared/core/themes/presets/`). The proto bar flips between the two.
- **Components** as CSS classes, each naming the real one it mirrors: `.btn`, `.icon-btn`, `.badge`,
  `.section`, `.field-box`, `.seg`, `.switch`, `.check`, `.select`, `.list-row`, `.tabs-list`,
  `.toolbar`, `.floating-panel`, `.menu`, `.dialog`, `.toast`, `.empty`, `.avatar`, `.swatch`.
- **The editor's layout**: the design editor's rail, left panel, rulers, canvas and properties panel,
  or the board's floating top bar, dot-grid canvas, side panels, toolbar and zoom.
- **Behavior** through `data-*` attributes (tabs, menus, dialogs, toggles, picks, toasts), listed
  above the `<script>`. Write JS only when they aren't enough.
- **Icons**: a sprite of lucide icons (what the app uses), `<svg class="i"><use href="#i-NAME" /></svg>`.

## Rules

The app's UI rules apply (see `CLAUDE.md`, "UI"): semantic colors only in the chrome (canvas content
such as sticky colors is document data and may be literal), corners of 4px for controls, 6px for
cards and menus and 8px at most, no pills, the app's control and row sizes. Reuse the template's
classes before writing CSS.

## Keeping them in step

When tokens, a theme, the panel sizes or a shared component's look change in the app, update both
templates. A finished prototype is a record of a proposal; it doesn't need updating.
