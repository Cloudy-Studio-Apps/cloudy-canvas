import { useVariablesWindowStore } from "./variables-window-store";

/** Opens the Variables window where it was last (or its default place). */
export function openVariablesWindow(): void {
  useVariablesWindowStore.getState().setOpen(true);
}

/** Whether the Variables window is open. */
export function useVariablesWindowOpen(): boolean {
  return useVariablesWindowStore((state) => state.open);
}
