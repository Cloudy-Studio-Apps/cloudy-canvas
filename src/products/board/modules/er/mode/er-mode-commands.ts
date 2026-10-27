import type { ErModeCommand } from "./er-mode.types";
import { t } from "../er.i18n";

/**
 * What the ER mode's keys add, each the same as clicking its palette item (`erClickActions`). The
 * module turns them into host commands (no keys of their own) and the mode's keybindings, so the
 * keys exist only while the ER mode is on. (H stays the hand tool's, hence I for "is a".)
 */
export const ER_MODE_COMMANDS: readonly ErModeCommand[] = [
  {
    command: "er.addEntity",
    item: "entity",
    label: t("modeCommands.addEntity"),
    keys: [{ key: "n" }],
  },
  {
    command: "er.addAttribute",
    item: "attribute",
    label: t("modeCommands.addAttribute"),
    keys: [{ key: "a" }],
  },
  {
    command: "er.addKeyAttribute",
    item: "key-attribute",
    label: t("modeCommands.addKeyAttribute"),
    keys: [{ key: "a", shift: true }],
  },
  {
    command: "er.addRelation",
    item: "relation",
    label: t("modeCommands.addRelation"),
    keys: [{ key: "r" }],
  },
  {
    command: "er.addIsa",
    item: "isa",
    label: t("modeCommands.addIsa"),
    keys: [{ key: "i" }],
  },
];
