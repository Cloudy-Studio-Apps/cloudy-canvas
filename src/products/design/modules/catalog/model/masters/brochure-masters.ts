import type { CanvasDocument } from "@canvas";
import { createId } from "@shared/core";

import type {
  BrochureMaster,
  BrochureNumbering,
  BrochureSection,
  BrochureSettings,
} from "../../brochure";
import { brochurePageSize } from "../page-span";
import type { DesignBrochure } from "../design-brochure";
import { createMasterFrames } from "./create-master-frames";
import { renameMaster, setSlotMaster, skipMasterLayer, withoutMaster } from "./master-edits";

/** What a new master is called before it's renamed ("A-Master", "B-Master", …). */
function masterName(count: number): string {
  return `${String.fromCharCode(65 + (count % 26))}-Master`;
}

/**
 * A brochure's masters, sections and numbering: each edit is one undo step of its brochure
 * (`DesignBrochure.write`), and the pages' master copies follow in it (`syncPageItems`).
 */
export class BrochureMasters {
  constructor(
    private readonly doc: CanvasDocument,
    private readonly brochure: DesignBrochure,
  ) {}

  list(): BrochureMaster[] {
    return this.brochure.record()?.masters ?? [];
  }

  sections(): BrochureSection[] {
    return this.brochure.record()?.sections ?? [];
  }

  /**
   * Adds a master, with a left and a right frame the brochure's page size above its design page's
   * layers, named `name` (else "A-Master", …), the default when it's the first. Returns its id,
   * `null` when the brochure is gone.
   */
  add(name?: string): string | null {
    const record = this.brochure.record();
    if (!record) return null;
    const size = brochurePageSize(this.brochure.pages()) ?? { w: 595, h: 842 };
    const id = createId();
    const label = name?.trim() || masterName(record.masters.length);
    const frames = createMasterFrames(this.doc, record.page, label, size);
    const master: BrochureMaster = {
      id,
      name: label,
      left: frames.left.id,
      right: frames.right.id,
    };
    const settings: BrochureSettings =
      record.settings.defaultMaster === null && record.masters.length === 0
        ? { ...record.settings, defaultMaster: id }
        : record.settings;
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.add(frames.left);
      this.doc.add(frames.right);
      this.brochure.write({ masters: [...record.masters, master], settings });
    });
    return id;
  }

  rename(id: string, name: string): void {
    const record = this.brochure.record();
    if (!record || !name.trim()) return;
    this.brochure.write({ masters: renameMaster(record.masters, id, name.trim()) });
  }

  /** Takes a master out (its frames stay in the design, as ordinary frames). */
  remove(id: string): void {
    const record = this.brochure.record();
    if (!record?.masters.some((master) => master.id === id)) return;
    this.brochure.write(withoutMaster(record, id));
  }

  /** The master pages show: `undefined` the brochure's default, `null` none. */
  setPageMaster(slotIds: Iterable<string>, master: string | null | undefined): void {
    const record = this.brochure.record();
    if (!record) return;
    this.brochure.write({ slots: setSlotMaster(record.slots, slotIds, master) });
  }

  /** Detached master layers (their ids on the master) are no longer stamped on page `slotId`. */
  skip(slotId: string, sources: readonly string[]): void {
    const record = this.brochure.record();
    if (!record || sources.length === 0) return;
    this.brochure.write({ slots: skipMasterLayer(record.slots, slotId, sources) });
  }

  /** Replaces the sections (one per starting page; those on pages not in it are dropped). */
  setSections(sections: readonly BrochureSection[]): void {
    const present = new Set(this.brochure.record()?.slots.map((slot) => slot.id));
    this.brochure.write({ sections: sections.filter((section) => present.has(section.start)) });
  }

  setNumbering(patch: Partial<BrochureNumbering>): void {
    const settings = this.brochure.settings();
    this.brochure.setSettings({ numbering: { ...settings.numbering, ...patch } });
  }
}
