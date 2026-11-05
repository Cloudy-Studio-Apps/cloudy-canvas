import type { ElementPatch } from "@canvas";

import { documentScopes, layeredScope } from "../../data";
import type { BrochureSettings } from "../brochure";
import type { FrameElement } from "../../frame";
import { BrochurePageEdits } from "./brochure-page-edits";
import { BrochureMasters } from "./masters/brochure-masters";
import { withSection } from "./sections/section-edits";
import { brochureLanguage, retranslateItems } from "./language";
import { generatedLayers } from "./repeats/generated-layers";
import { loopsAround } from "./repeats/loops-around";
import { repeatEdit } from "./repeats/repeat-edits";
import type { BrochureRepeat } from "./repeats/brochure-repeat.types";
import type { RepeatTarget } from "./repeats/repeat-edits.types";

/**
 * One brochure (a record of `DESIGN_BROCHURES`, which hands these out) and the only place that
 * edits its pages and settings: each edit is one undo step. Frames are kept by id; deleted ones
 * are pruned with their deletion (`pruneBrochure`). Its reads, write and arranging are
 * `BrochureHandle`'s, its page edits `BrochurePageEdits`'; here are its repeats, settings,
 * sections and masters.
 */
export class DesignBrochure extends BrochurePageEdits {
  /**
   * Sets a section's or page's repeat (merged over the one there), or removes it (`null`): the
   * pages its loop made go, frames and slots, and the template pages stay as normal pages. One
   * undo step; the copies are then made by the edit's sync (`syncBrochureRepeats`). Throws for a
   * section or page not in the brochure, a page a repeat made, a repeat with no list or a new
   * list that isn't one in its scope; a new list with no key given takes an id-like field
   * (`repeatEdit`).
   */
  setRepeat(target: RepeatTarget, repeat: Partial<BrochureRepeat> | null): void {
    const record = this.record();
    if (!record) return;
    const scope =
      repeat === null
        ? undefined
        : layeredScope(
            documentScopes(this.doc).root,
            loopsAround(record, this.expansion(), target),
          );
    const edit = repeatEdit(record, target, repeat, scope);
    if (!edit) return;
    const { gone, ...patch } = edit;
    const layers = generatedLayers(this.doc, record.id, gone);
    this.doc.checkpoint();
    this.doc.batch(() => {
      if (layers.length > 0) this.doc.remove(layers);
      this.write(patch);
    });
  }

  /**
   * Adds a new frame to the design as a page at `at` (default: the end) that starts a section
   * named `name` at `level` (0, the top), in one undo step.
   */
  addNewSection(frame: FrameElement, name: string, at?: number, level = 0): void {
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.add(frame);
      this.addPages([frame.id], at);
      const slot = this.record()?.slots.find((item) => item.frames.includes(frame.id));
      if (!slot) return;
      this.masters.setSections(withSection(this.masters.sections(), slot.id, level, name));
    });
  }

  /**
   * Changes settings, in one undo step. A new `language` also rewrites its built-in page items
   * and master frames' words in it (`retranslateItems`).
   */
  setSettings(patch: Partial<BrochureSettings>): void {
    const settings = { ...this.settings(), ...patch };
    if (JSON.stringify(settings) === JSON.stringify(this.settings())) return;
    const record = this.record();
    const words =
      record && settings.language !== record.settings.language
        ? retranslateItems(this.doc, record, brochureLanguage(settings))
        : new Map<string, ElementPatch>();
    if (words.size === 0) {
      this.write({ settings });
      return;
    }
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.write({ settings });
      this.doc.updateMany(words);
    });
  }

  /** Its masters, sections and numbering (see `BrochureMasters`). */
  get masters(): BrochureMasters {
    return new BrochureMasters(this.doc, this);
  }
}
