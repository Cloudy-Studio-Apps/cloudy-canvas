import { useEditorPoint } from "./editor-modules-context";
import type { ModuleSlotProps } from "./editor-points.types";

/** What the modules put in one of the editor's slots (the side dock, the top bar), in order. */
export function ModuleSlot({ slot }: ModuleSlotProps) {
  const entries = [...useEditorPoint((points) => points[slot])].sort((a, b) => a.order - b.order);
  return entries.map(({ id, component: Entry }) => <Entry key={id} />);
}
