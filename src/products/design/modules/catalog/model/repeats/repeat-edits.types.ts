import type { BrochureSection, BrochureSlot } from "../../brochure";

/** What a repeat is set on: a section ("Repeat for each row") or a page ("Repeat this page"). */
export type RepeatTarget = { section: string } | { slot: string };

/** A repeat set or removed: the record's new fields and the copies that go with it. */
export interface RepeatEdit {
  sections?: BrochureSection[];
  slots?: BrochureSlot[];
  /** The slots of the copies it made (removing a repeat), whose frames go too. */
  gone: BrochureSlot[];
}
