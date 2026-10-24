import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "./default-value";
import type { NewVariable, SetValueOptions, VariablePatch } from "./document-tokens.types";
import { detachEverywhere } from "./detach-bindings";
import { followBase } from "./generator-writes";
import { ModeEdits } from "./mode-edits";
import { normalizeTokenPath, renamePrefix } from "./token-path";
import { TokenStore } from "./token-store";
import type { TokenValue, VariableRecord } from "./token.types";

/** Variables: making, renaming, values per mode, groups, order, deleting; one undo step each. */
export abstract class VariableEdits extends ModeEdits {
  // ── Variables ───────────────────────────────────────────────────────

  createVariable(spec: NewVariable): VariableRecord {
    return this.createVariables([spec])[0] as VariableRecord;
  }

  /** Several variables in one undo step, checked before anything is written. */
  createVariables(specs: readonly NewVariable[]): VariableRecord[] {
    let store = this.store();
    const records: VariableRecord[] = [];
    for (const spec of specs) {
      const collection = this.requireCollection(spec.collectionId);
      const taken = [
        ...store.variables(collection.id).map((v) => v.name),
        ...records.filter((r) => r.collectionId === collection.id).map((r) => r.name),
      ];
      const last =
        records.filter((r) => r.collectionId === collection.id).at(-1) ??
        store.variables(collection.id).at(-1);
      const value = this.checkValue(store, null, spec.type, spec.value);
      records.push({
        kind: "variable",
        id: createId(),
        collectionId: collection.id,
        name: this.freeName(normalizeTokenPath(spec.name) || "Variable", taken),
        type: spec.type,
        axisId: null,
        values: { [DEFAULT_VALUE]: value },
        scopes: spec.scopes ?? [],
        description: spec.description ?? "",
        codeSyntax: spec.codeSyntax ?? {},
        hidden: spec.hidden ?? false,
        order: generateKeyBetween(last?.order ?? null, null),
      });
      store = new TokenStore([...this.doc.tokenRecords(), ...records]);
    }
    this.write(() => this.doc.setTokenRecords(records));
    return records;
  }

  updateVariable(id: string, patch: VariablePatch): void {
    const variable = this.requireVariable(id);
    const next: VariableRecord = { ...variable };
    if (patch.name !== undefined) {
      const path = normalizeTokenPath(patch.name);
      if (path && path !== variable.name) {
        const taken = this.store()
          .variables(variable.collectionId)
          .filter((v) => v.id !== id)
          .map((v) => v.name);
        next.name = this.freeName(path, taken);
      }
    }
    if (patch.scopes) next.scopes = [...patch.scopes];
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.codeSyntax) next.codeSyntax = { ...patch.codeSyntax };
    if (patch.hidden !== undefined) next.hidden = patch.hidden;
    this.write(() => this.doc.setTokenRecords([next]));
  }

  /**
   * Sets a variable's value: its default (`DEFAULT_VALUE`, or its axis's base mode), or its
   * override for a mode. A mode of another axis makes it vary by that axis when it has no
   * overrides yet. Throws on a wrong type, an unknown alias, a loop or a mode it can't take.
   */
  setValue(id: string, mode: string, value: TokenValue, options: SetValueOptions = {}): void {
    const variable = this.requireVariable(id);
    const checked = this.checkValue(this.store(), id, variable.type, value);
    const { key, axisId } = this.valueKey(variable, mode);
    const next = {
      ...variable,
      axisId,
      values: { ...variable.values, [key]: checked },
      // A shade set by hand leaves its generator.
      generatorId: null,
    };
    this.write(() => {
      this.doc.setTokenRecords([next]);
      followBase(this.doc, id);
    }, options.checkpoint ?? true);
  }

  /** Removes a variable's override for a mode: it shows its default there again. */
  clearValue(id: string, mode: string): void {
    const variable = this.requireVariable(id);
    if (mode === DEFAULT_VALUE || !(mode in variable.values)) return;
    const values = { ...variable.values };
    delete values[mode];
    this.write(() => {
      this.doc.setTokenRecords([{ ...variable, values, generatorId: null }]);
      followBase(this.doc, id);
    });
  }

  /** Renames a group: every variable under `from` moves under `to`. */
  renameGroup(collectionId: string, from: string, to: string): void {
    const target = normalizeTokenPath(to);
    const moved = this.store()
      .variables(collectionId)
      .flatMap((v) => {
        const name = renamePrefix(v.name, from, target);
        return name && name !== v.name ? [{ ...v, name }] : [];
      });
    if (moved.length > 0) this.write(() => this.doc.setTokenRecords(moved));
  }

  /** Moves variables into a group (`""`: the top), keeping their own names. */
  moveVariables(ids: readonly string[], group: string): void {
    const prefix = normalizeTokenPath(group);
    const moved = ids.map((id) => {
      const v = this.requireVariable(id);
      const leaf = v.name.slice(v.name.lastIndexOf("/") + 1);
      return { ...v, name: prefix ? `${prefix}/${leaf}` : leaf };
    });
    this.write(() => this.doc.setTokenRecords(moved));
  }

  /** Puts a variable before `beforeId` in its collection (`null`: last). */
  reorderVariable(id: string, beforeId: string | null): void {
    const variable = this.requireVariable(id);
    const list = this.store()
      .variables(variable.collectionId)
      .filter((v) => v.id !== id);
    const at = beforeId === null ? list.length : list.findIndex((v) => v.id === beforeId);
    const index = at < 0 ? list.length : at;
    const order = generateKeyBetween(list[index - 1]?.order ?? null, list[index]?.order ?? null);
    this.write(() => this.doc.setTokenRecords([{ ...variable, order }]));
  }

  /** Deletes variables; the layers using them keep what they show, unlinked. */
  deleteVariables(ids: readonly string[]): void {
    const known = ids.filter((id) => this.store().variable(id));
    if (known.length === 0) return;
    this.write(() => {
      detachEverywhere(this.doc, new Set(known));
      this.doc.removeTokenRecords(known);
    });
  }
}
