import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "./default-value";
import { detachEverywhere } from "./detach-bindings";
import { deletionRewrites } from "./token-deletion";
import { TokenEditsBase, withoutOverrides } from "./token-edits-base";
import type { MoveModeResult } from "./document-tokens.types";
import type { CollectionRecord, ModeAxisRecord, ModeDef } from "./token.types";
import { keyBetween } from "../utils";

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
      order: keyBetween(store.collections().at(-1)?.order ?? null, null),
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
      order: keyBetween(store.axes().at(-1)?.order ?? null, null),
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

  /**
   * Moves a mode into another axis (grouping modes put on the wrong one: Español off Theme into
   * Language), at its end or before `beforeId`. An axis's first mode can't move: its values are
   * the defaults. Variables whose only override on the old axis is this mode vary by the new one;
   * those with others keep them and lose this mode's value (`dropped`, they vary by one axis).
   * Pages and layers set to the mode keep it, under the new axis. One undo step.
   */
  moveMode(modeId: string, toAxisId: string, beforeId?: string): MoveModeResult {
    const store = this.store();
    const from = store.axes().find((a) => a.modes.some((m) => m.id === modeId));
    if (!from) throw new Error(`No mode with id ${modeId}.`);
    const to = this.requireAxis(toAxisId);
    const mode = from.modes.find((m) => m.id === modeId) as ModeDef;
    if (from.id === to.id) return this.reorderMode(from, mode, beforeId);
    if (from.modes[0]?.id === modeId) {
      throw new Error(
        `${mode.name} is ${from.name}'s first mode: its values are the defaults, so it stays.`,
      );
    }
    const at = beforeId ? to.modes.findIndex((m) => m.id === beforeId) : -1;
    // Before the base would make it the base: it goes after it at the earliest.
    const index = at < 1 ? to.modes.length : at;
    const name = this.freeName(
      mode.name,
      to.modes.map((m) => m.name),
    );
    const modes = [...to.modes.slice(0, index), { ...mode, name }, ...to.modes.slice(index)];
    let dropped = 0;
    const variables = this.onAxis(from.id).flatMap((v) => {
      if (!(modeId in v.values)) return [];
      const others = Object.keys(v.values).filter((k) => k !== DEFAULT_VALUE && k !== modeId);
      if (others.length === 0) return [{ ...v, axisId: to.id }];
      dropped++;
      const values = { ...v.values };
      delete values[modeId];
      return [{ ...v, values }];
    });
    const fromRecord: ModeAxisRecord = {
      ...from,
      modes: from.modes.filter((m) => m.id !== modeId),
      current: from.current === modeId ? undefined : from.current,
    };
    this.write(() => {
      this.doc.setTokenRecords([fromRecord, { ...to, modes }, ...variables]);
      for (const id of this.doc.ids()) {
        const picks = this.doc.field(id, "variableModes");
        if (typeof picks !== "object" || picks === null) continue;
        const own = picks as Record<string, string>;
        if (own[from.id] !== modeId) continue;
        const next = { ...own, [to.id]: modeId };
        delete next[from.id];
        this.doc.update(id, { variableModes: next });
      }
    });
    return { dropped };
  }

  /** A mode put before `beforeId` in its own axis (its end without one); never before the base. */
  private reorderMode(axis: ModeAxisRecord, mode: ModeDef, beforeId?: string): MoveModeResult {
    if (axis.modes[0]?.id === mode.id || beforeId === mode.id) return { dropped: 0 };
    const rest = axis.modes.filter((m) => m.id !== mode.id);
    const at = beforeId ? rest.findIndex((m) => m.id === beforeId) : -1;
    const index = at < 1 ? rest.length : at;
    const modes = [...rest.slice(0, index), mode, ...rest.slice(index)];
    if (modes.every((m, i) => m.id === axis.modes[i]?.id)) return { dropped: 0 };
    this.write(() => this.doc.setTokenRecords([{ ...axis, modes }]));
    return { dropped: 0 };
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
