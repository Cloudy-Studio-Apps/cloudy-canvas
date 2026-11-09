import { Keymap, type Keybindings } from "@canvas";
import { isApplePlatform } from "@shared/core";

const GO_TO_COMMANDS = Array.from({ length: 9 }, (_, i) => `tab.goTo${i + 1}`);

/** The tab shortcuts: command id → shortcuts. `tab.goTo1`…`tab.goTo9` pick the 1st…9th file tab. */
export const TAB_KEYBINDINGS: Keybindings = {
  // Cmd+Tab belongs to macOS, so there Cmd+Shift+] / [ come first (shown) and Ctrl+Tab still works.
  "tab.next": [
    ...(isApplePlatform() ? [{ code: "BracketRight", mod: true, shift: true, label: "]" }] : []),
    { key: "Tab", mod: true, label: "Tab" },
  ],
  "tab.previous": [
    ...(isApplePlatform() ? [{ code: "BracketLeft", mod: true, shift: true, label: "[" }] : []),
    { key: "Tab", mod: true, shift: true, label: "Tab" },
  ],
  "tab.close": [{ key: "w", mod: true }],
  "tab.reopen": [{ key: "t", mod: true, shift: true }],
  ...Object.fromEntries(
    GO_TO_COMMANDS.map((command, i) => [
      command,
      [{ code: `Digit${i + 1}`, mod: true, label: String(i + 1) }],
    ]),
  ),
};

/** The one `Keymap` for the tab shortcuts: matches key events and gives the labels the UI shows. */
export const tabKeymap = new Keymap(TAB_KEYBINDINGS);
