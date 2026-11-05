import type { BrochureSlot } from "../../brochure";
import { expandedId } from "./expanded-id";

/** The expanded page a slot holds (`ExpandedPage.id`): its own id, or a copy's `expandedId`. */
export function slotKey(slot: BrochureSlot): string {
  return slot.generated ? expandedId(slot.generated.from, slot.generated.path) : slot.id;
}
