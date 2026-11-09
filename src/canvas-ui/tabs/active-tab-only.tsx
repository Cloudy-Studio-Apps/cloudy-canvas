import type { ActiveTabOnlyProps } from "./active-tab-only.types";
import { useIsActiveTab } from "./use-is-active-tab";

/**
 * Renders `children` only while the editor's tab is the one on screen (always outside a tab).
 * Several editors of one product can be mounted at once, and UI driven by an app-wide store
 * (dialogs, the prototype player, anything portaled to `<body>`) would otherwise open in all of
 * them; leaving the tab unmounts it, the way leaving an editor did.
 */
export function ActiveTabOnly({ children }: ActiveTabOnlyProps) {
  return useIsActiveTab() ? children : null;
}
