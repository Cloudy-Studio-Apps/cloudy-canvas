import { shortcutLabel } from "../input/keymap";
import type { ElementInfo } from "./element.info.types";
import { elementKinds } from "./element.registry";

/**
 * Label, description and hotkey of an element type, read from its kind and the keymap.
 * `undefined` when no kind is registered for the type.
 */
export function elementInfo(type: string): ElementInfo | undefined {
  const kind = elementKinds.get(type);
  if (!kind) return undefined;
  const shortcut = kind.tool ? shortcutLabel(`tool.${kind.tool}`) : undefined;
  return {
    type,
    label: kind.label,
    description: kind.description,
    ...(shortcut ? { shortcut } : {}),
  };
}
