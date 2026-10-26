import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "./default-value";
import { detachEverywhere } from "./detach-bindings";
import { deletionRewrites } from "./token-deletion";
import { TokenEditsBase, withoutOverrides } from "./token-edits-base";
import type { CollectionRecord, ModeAxisRecord, ModeDef } from "./token.types";

/** Collections (folders of variables) and the file's mode axes, one undo step per edit. */
export abstract class ModeEdits extends TokenEditsBase {
  // ── Collections (folders) ───────────────────────────────────────

  createCollection(name: string): CollectionRecord {
    const store = this.store();
    const record: CollectionRecord = {
      kind: "collection",
      id: createId(),
      name: this.freeName(
        name.trim() || "Collection",
        store.collections().map((c) => c.name),
      ),
      order: generateKeyBetween(store.collections().at(-1)?.order ?? null, null),
    };
    this.write(() => this.doc.setTokenRecords([record]));
    return record;
  }

  renameCollection(id: string, name: string): void {
    const collection = this.requireCollection(id);
    const text = name.trim();
    if (!text || text === collection.name) return;
    this.write(() => this.doc.setTokenRecords([{ ...collection, name: text }]));
  }

  /** Removes a collection with its variables; layers using them keep what they show. */
  deleteCollection(id: string): void {
    this.requireCollection(id);
    const variables = this.store()
      .variables(id)
      .map((v) => v.id);
    const rewrites = deletionRewrites(this.store(), variables);
    this.write(() => {
      if (rewrites.length > 0) this.doc.setTokenRecords(rewrites);
      detachEverywhere(this.doc, new Set(variables));
      this.doc.removeTokenRecords([...variables, id]);
    });
  }

  // ── Mode axes ───────────────────────────────────────────────────────

  /** Adds a mode axis (Theme, Brand, Device…) with these modes (the first is its base). */
  createAxis(name: string, modeNames: readonly string[] = ["Default"]): ModeAxisRecord {
    const store = this.store();
    const record: ModeAxisRecord = {
      kind: "axis",
      id: createId(),
      name: this.freeName(
        name.trim() || "Modes",
        store.axes().map((a) => a.name),
      ),
      modes: (modeNames.length > 0 ? modeNames : ["Default"]).map((mode) => ({
        id: createId(),
        name: mode.trim() || "Mode",
      })),
      order: generateKeyBetween(store.axes().at(-1)?.order ?? null, null),
    };
    this.write(() => this.doc.setTokenRecords([record]));
    return record;
  }

  renameAxis(id: string, name: string): void {
    const axis = this.requireAxis(id);
    const text = name.trim();
    if (!text || text === axis.name) return;
    this.write(() => this.doc.setTokenRecords([{ ...axis, name: text }]));
  }

  /** Removes an axis: the variables varying by it keep only their default values. */
  deleteAxis(id: string): void {
    this.requireAxis(id);
    this.write(() => {
      this.doc.setTokenRecords(this.onAxis(id).map((v) => withoutOverrides(v)));
      this.doc.removeTokenRecords([id]);
    });
  }

  /**
   * Adds a mode to an axis (`null`: the file's first one, made with a "Default" base when there's
   * none, so files never need to know about axes until they want a second one).
   */
  addMode(axisId: string | null, name?: string): ModeDef {
    let axis = axisId ? this.requireAxis(axisId) : this.store().axes()[0];
    if (!axis) axis = this.createAxis("Modes");
    const mode: ModeDef = {
      id: createId(),
      name: this.freeName(
        name?.trim() || `Mode ${axis.modes.length + 1}`,
        axis.modes.map((m) => m.name),
      ),
    };
    const target = axis;
    this.write(() => this.doc.setTokenRecords([{ ...target, modes: [...target.modes, mode] }]));
    return mode;
  }

  renameMode(axisId: string, modeId: string, name: string): void {
    const axis = this.requireAxis(axisId);
    const text = name.trim();
    if (!text) return;
    this.write(() =>
      this.doc.setTokenRecords([
        { ...axis, modes: axis.modes.map((m) => (m.id === modeId ? { ...m, name: text } : m)) },
      ]),
    );
  }

  /**
   * Removes a mode (never the last). Its overrides go; removing the base makes the next mode the
   * base, its overrides becoming the defaults. Layers set to it use the file's mode.
   */
  removeMode(axisId: string, modeId: string): void {
    const axis = this.requireAxis(axisId);
    if (axis.modes.length <= 1) throw new Error("An axis keeps at least one mode.");
    if (!axis.modes.some((m) => m.id === modeId)) return;
    const modes = axis.modes.filter((m) => m.id !== modeId);
    const newBase = axis.modes[0]?.id === modeId ? modes[0]?.id : undefined;
    const variables = this.onAxis(axisId).map((v) => {
      const values = { ...v.values };
      if (newBase && values[newBase]) {
        values[DEFAULT_VALUE] = values[newBase];
        delete values[newBase];
      }
      delete values[modeId];
      return { ...v, values };
    });
    const current = axis.current === modeId ? undefined : axis.current;
    this.write(() => this.doc.setTokenRecords([{ ...axis, modes, current }, ...variables]));
  }

  /** The mode the whole file shows on an axis (the global switch); pages and frames may differ. */
  setCurrentMode(axisId: string, modeId: string): void {
    const axis = this.requireAxis(axisId);
    if (!axis.modes.some((m) => m.id === modeId) || axis.current === modeId) return;
    this.write(() => this.doc.setTokenRecords([{ ...axis, current: modeId }]));
  }

  /** Makes a variable vary by an axis (`null`: by none), dropping overrides it had for another. */
  setVariableAxis(id: string, axisId: string | null): void {
    const variable = this.requireVariable(id);
    if (axisId) this.requireAxis(axisId);
    if ((variable.axisId ?? null) === axisId) return;
    this.write(() => this.doc.setTokenRecords([{ ...withoutOverrides(variable), axisId }]));
  }
}
