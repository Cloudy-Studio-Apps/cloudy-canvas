import type { ErModeCommand } from "./er-mode.types";

/**
 * What the ER mode's keys add, each the same as clicking its palette item (`erClickActions`). The
 * module turns them into host commands (no keys of their own) and the mode's keybindings, so the
 * keys exist only while the ER mode is on. (H stays the hand tool's, hence I for "is a".)
 */
export const ER_MODE_COMMANDS: readonly ErModeCommand[] = [
  { command: "er.addEntity", item: "entity", label: "Add an entity", keys: [{ key: "n" }] },
  {
    command: "er.addAttribute",
    item: "attribute",
    label: "Add an attribute to the selection",
    keys: [{ key: "a" }],
  },
  {
    command: "er.addKeyAttribute",
    item: "key-attribute",
    label: "Add a key attribute to the selection",
    keys: [{ key: "a", shift: true }],
  },
  {
    command: "er.addRelation",
    item: "relation",
    label: "Add a relation from the selection",
    keys: [{ key: "r" }],
  },
  {
    command: "er.addIsa",
    item: "isa",
    label: "Add a hierarchy under the selection",
    keys: [{ key: "i" }],
  },
];
