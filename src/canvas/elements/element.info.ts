import type { Keymap } from "../input/keymap";
import type { ElementKind } from "./element.kind";
import type { ElementInfo } from "./element.info.types";

/** Label, description and hotkey of an element type, read from its kind and the keymap. */
export function elementInfo(kind: ElementKind, keymap: Keymap): ElementInfo {
  const shortcut = kind.tool ? keymap.label(`tool.${kind.tool}`) : undefined;
  return {
    type: kind.type,
    label: kind.label,
    description: kind.description,
    ...(shortcut ? { shortcut } : {}),
  };
}
