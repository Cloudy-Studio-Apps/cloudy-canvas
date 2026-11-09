# Main menu (shared)

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

The pieces of a product's main menu, the same for the board and the design. A product's `mainMenu`
point (`boardEditor.mainMenu`, `designEditor.mainMenu`) collects `MainMenuGroup`s from its modules;
an item is an engine command (named and bound by the keymap) or a `run({ engine, navigate })`
action, and may be a checkbox (`checked(engine)`).

- **`MainMenuSectionsView({ groups, engine, navigate })`** draws the inside of the dropdown: groups
  sorted by `order`, a group without a label listed as its items, labelled groups next to each
  other as submenus (File, Edit, …), separators between sections (`mainMenuSections`).
  `MainMenuEntry` shows the shortcut from `engine.keymap.label(command)` and disables a command
  the mode doesn't run (`engine.allowsCommand`); `mainMenuLabel` names an item (its own label or
  its command's); `runMainMenuItem` picks one.
- The title bar's seal shows a file tab's menu through `useTabMenu` ([tabs/](../tabs/README.md));
  the design's rail shows it on Android (`DesignMainMenu`).
