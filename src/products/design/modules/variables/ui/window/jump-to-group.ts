import { useVariablesWindowStore } from "./variables-window-store";

/** Scrolls the board to a group and makes its title pulse. */
export function jumpToGroup(group: string): void {
  const section = document.querySelector(`[data-group="${CSS.escape(group)}"]`);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.classList.add("animate-pulse");
  setTimeout(() => section.classList.remove("animate-pulse"), 900);
}

/** Opens the Variables window on a collection, scrolled to one of its groups. */
export function openWindowAt(collectionId: string, group: string): void {
  const store = useVariablesWindowStore.getState();
  store.showCollection(collectionId);
  store.setOpen(true);
  // The board draws on the next frame; scroll once it's there.
  requestAnimationFrame(() => requestAnimationFrame(() => jumpToGroup(group)));
}
