import type { BrochureElement, BrochureSlot } from "../../brochure";
import type { BrochureRepeat } from "./brochure-repeat.types";
import { segmentOwner } from "./copy-segment";
import type { RepeatEdit, RepeatTarget } from "./repeat-edits.types";

/** A repeat as it reads with nothing set yet. */
const EMPTY: BrochureRepeat = { source: "", as: "", filter: [], sort: [], detached: [] };

/** Whether a copy was made in a pass of `owner`'s loop (removing that loop removes it). */
function madeBy(slot: BrochureSlot, owner: string): boolean {
  return !!slot.generated?.path.some((segment) => segmentOwner(segment) === owner);
}

function without<T extends { repeat?: BrochureRepeat }>(item: T): T {
  const out = { ...item };
  delete out.repeat;
  return out;
}

/**
 * A section's or page's repeat set (`repeat` merged over the one there; a list to read is
 * required) or removed (`null`: the copies its loop made go, the template pages stay as normal
 * pages). `null` when nothing changes. Throws for a section or page that isn't in the brochure,
 * a copy a repeat made, or a repeat with no list. Pure.
 */
export function repeatEdit(
  record: Pick<BrochureElement, "slots" | "sections">,
  target: RepeatTarget,
  repeat: Partial<BrochureRepeat> | null,
): RepeatEdit | null {
  const id = "section" in target ? target.section : target.slot;
  const section = "section" in target ? record.sections.find((item) => item.id === id) : undefined;
  const slot = "slot" in target ? record.slots.find((item) => item.id === id) : undefined;
  if (!section && !slot) throw new Error(`"${id}" isn't a section or page of the brochure.`);
  if (slot?.generated) throw new Error("A page a repeat made can't repeat itself.");
  const current = (section ?? slot)?.repeat;

  if (repeat === null) {
    if (!current) return null;
    const gone = record.slots.filter((item) => madeBy(item, id));
    const slots = record.slots.filter((item) => !madeBy(item, id));
    if (section) {
      const sections = record.sections.map((item) => (item.id === id ? without(item) : item));
      return { sections, slots, gone };
    }
    return { slots: slots.map((item) => (item.id === id ? without(item) : item)), gone };
  }

  const next: BrochureRepeat = { ...EMPTY, ...current, ...repeat };
  if (!next.source.trim()) throw new Error("A repeat needs a list to repeat over (its source).");
  if (JSON.stringify(next) === JSON.stringify(current)) return null;
  if (section) {
    const sections = record.sections.map((item) =>
      item.id === id ? { ...item, repeat: next } : item,
    );
    return { sections, gone: [] };
  }
  const slots = record.slots.map((item) => (item.id === id ? { ...item, repeat: next } : item));
  return { slots, gone: [] };
}
