import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import type { CanvasDocument } from "../document";
import type { ElementPatch } from "../elements/element.types";
import { defineService } from "../services";
import { BindingIndex } from "./binding-index";
import { detachEverywhere, pathsOverlap } from "./detach-bindings";
import type {
  GeneratorInput,
  NewStyle,
  ScaleInput,
  SetValueOptions,
  StylePatch,
} from "./document-tokens.types";
import { followBase, regenerate } from "./generator-writes";
import { deletionRewrites } from "./token-deletion";
import { replacePlan } from "./replace-token";
import { tokenUsage, unusedTokens } from "./token-usage";
import type { TokenUsage } from "./token-usage.types";
import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";
import { TokenFeed } from "./token-feed";
import { normalizeTokenPath } from "./token-path";
import { resolveStyle } from "./resolve-style";
import { keptStyleBindings, styleLeafType, stylesWithout } from "./style-bindings";
import type { StyleRecord } from "./token.types";
import { VariableEdits } from "./variable-edits";

/**
 * A document's variables, collections, modes, shade generators, scales and styles, and the only
 * place that edits them: each edit is one undo step (made as whoever edits the document: the
 * user, or an agent through its workspace). `subscribe`/`getVersion` for `useSyncExternalStore`;
 * reads go through `store()`. Its parts: `TokenEditsBase` → `ModeEdits` → `VariableEdits` → this.
 */
export class DocumentTokens extends VariableEdits {
  private readonly feed: TokenFeed;

  constructor(doc: CanvasDocument) {
    super(doc);
    this.feed = new TokenFeed(doc);
  }

  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  // ── Shade generators ────────────────────────────────────────────────

  /**
   * Makes (or, with `id`, changes) a shade generator and writes its shades in one undo step;
   * returns it. Its axis is the file's first with several modes unless it has one.
   */
  saveGenerator(input: GeneratorInput): GeneratorRecord {
    const store = this.store();
    const known = input.id ? store.generator(input.id) : undefined;
    const generator: GeneratorRecord = {
      ...input,
      kind: "generator",
      id: known?.id ?? createId(),
      group: normalizeTokenPath(input.group),
      axisId: input.axisId ?? known?.axisId ?? store.switchableAxes()[0]?.id ?? null,
      order: known?.order ?? generateKeyBetween(store.generators().at(-1)?.order ?? null, null),
    };
    this.requireCollection(generator.collectionId);
    this.write(() => {
      this.doc.setTokenRecords([generator]);
      regenerate(this.doc, generator);
    });
    return generator;
  }

  /** Stops a shade generator or a scale: what it made stays, unlinked. */
  removeGenerator(id: string): void {
    const shades = this.store()
      .variables()
      .filter((v) => v.generatorId === id)
      .map((v) => ({ ...v, generatorId: null }));
    this.write(() => {
      this.doc.setTokenRecords(shades);
      this.doc.removeTokenRecords([id]);
    });
  }

  /** Makes (or, with `id`, changes) a number scale and writes its steps in one undo step. */
  saveScale(input: ScaleInput): ScaleRecord {
    const store = this.store();
    const known = input.id ? store.scale(input.id) : undefined;
    const scale: ScaleRecord = {
      ...input,
      kind: "scale",
      id: known?.id ?? createId(),
      group: normalizeTokenPath(input.group),
      order: known?.order ?? generateKeyBetween(store.scales().at(-1)?.order ?? null, null),
    };
    this.requireCollection(scale.collectionId);
    this.write(() => {
      this.doc.setTokenRecords([scale]);
      regenerate(this.doc, scale);
    });
    return scale;
  }

  /** Unlinks one shade or step from what generated it (to tune it by hand). */
  unlinkShade(id: string): void {
    const variable = this.requireVariable(id);
    if (!variable.generatorId) return;
    this.write(() => this.doc.setTokenRecords([{ ...variable, generatorId: null }]));
  }

  // ── Styles ──────────────────────────────────────────────────────────

  /** Adds a style (named uniquely among its type), last of its type. */
  createStyle(spec: NewStyle): StyleRecord {
    const same = this.store().styles(spec.styleType);
    const record: StyleRecord = {
      kind: "style",
      id: createId(),
      styleType: spec.styleType,
      name: this.freeName(
        normalizeTokenPath(spec.name) || "Style",
        same.map((s) => s.name),
      ),
      value: structuredClone(spec.value),
      description: spec.description ?? "",
      order: generateKeyBetween(same.at(-1)?.order ?? null, null),
    };
    const store = this.store();
    const bindings = Object.fromEntries(
      Object.entries(spec.bindings ?? {}).filter(
        ([path, id]) => store.variable(id)?.type === styleLeafType(record.value, path),
      ),
    );
    if (Object.keys(bindings).length > 0) {
      record.bindings = bindings;
      record.value = resolveStyle(store, record, {});
    }
    this.write(() => this.doc.setTokenRecords([record]));
    return record;
  }

  /** Renames or changes a style; the layers using it follow in the same undo step. */
  updateStyle(id: string, patch: StylePatch, options: SetValueOptions = {}): void {
    const style = this.store().style(id);
    if (!style) throw new Error(`No style with id ${id}.`);
    const next: StyleRecord = { ...style };
    if (patch.name !== undefined) {
      const path = normalizeTokenPath(patch.name);
      if (path && path !== style.name) {
        const taken = this.store()
          .styles(style.styleType)
          .filter((s) => s.id !== id)
          .map((s) => s.name);
        next.name = this.freeName(path, taken);
      }
    }
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.value) next.value = { ...style.value, ...structuredClone(patch.value) };
    if (patch.bindings) next.bindings = { ...patch.bindings };
    else if (patch.value && style.bindings) next.bindings = keptStyleBindings(style, next.value);
    this.write(() => this.doc.setTokenRecords([next]), options.checkpoint ?? true);
  }

  /**
   * Binds the part of a style's value at `path` (`"paints.0.color"`) to a variable, or unlinks it
   * (`null`, keeping its value); bindings over or under the path are replaced. Its value takes the
   * variable's in the file's modes, and the layers using it follow, in one undo step.
   */
  bindStyleField(
    styleId: string,
    path: string,
    variableId: string | null,
    options: SetValueOptions = {},
  ): void {
    const store = this.store();
    const style = store.style(styleId);
    if (!style) throw new Error(`No style with id ${styleId}.`);
    const bindings = Object.fromEntries(
      Object.entries(style.bindings ?? {}).filter(([other]) => !pathsOverlap(path, other)),
    );
    let value = style.value;
    if (variableId !== null) {
      const variable = store.variable(variableId);
      if (!variable) throw new Error(`No variable with id ${variableId}.`);
      const expected = styleLeafType(style.value, path);
      if (!expected) throw new Error(`The style ${style.name} has no value at "${path}".`);
      if (expected !== variable.type) {
        throw new Error(
          `"${path}" takes a ${expected} variable; ${variable.name} is a ${variable.type}.`,
        );
      }
      bindings[path] = variable.id;
      value = resolveStyle(store, { ...style, bindings }, {});
    }
    this.write(
      () => this.doc.setTokenRecords([{ ...style, value, bindings }]),
      options.checkpoint ?? true,
    );
  }

  /** Deletes styles; the layers using them keep their look, unlinked. */
  deleteStyles(ids: readonly string[]): void {
    this.deleteTokens(ids.filter((id) => this.store().style(id)));
  }

  /** Deletes variables and styles in one undo step; layers using them keep what they show. */
  deleteTokens(ids: readonly string[]): void {
    const store = this.store();
    const known = ids.filter((id) => store.variable(id) ?? store.style(id));
    if (known.length === 0) return;
    const rewrites = deletionRewrites(store, known);
    this.write(() => {
      if (rewrites.length > 0) this.doc.setTokenRecords(rewrites);
      detachEverywhere(this.doc, new Set(known));
      this.doc.removeTokenRecords(known);
    });
  }

  /** The ids of the elements bound to a variable or a style. */
  usage(id: string): string[] {
    return [...BindingIndex.of(this.doc).boundTo(id)];
  }

  /** Where a variable or a style is used: layers (directly or through styles), aliases, styles, generators. */
  usageOf(id: string, counts?: (elementId: string) => boolean): TokenUsage {
    return tokenUsage(this.store(), BindingIndex.of(this.doc), id, counts);
  }

  /** The variables and styles nothing uses (no layer, alias, style or generator). */
  unused(counts?: (elementId: string) => boolean): string[] {
    return unusedTokens(this.store(), BindingIndex.of(this.doc), counts);
  }

  /**
   * Makes every use of `from` use `to` (layers, aliases, styles, generators), one undo step; the
   * layers then show `to`'s values. Throws for another type or a loop. Returns the layers rebound.
   */
  replaceUses(
    from: string,
    to: string,
    counts: (elementId: string) => boolean = () => true,
  ): number {
    const store = this.store();
    const records = replacePlan(store, from, to);
    const layers = [...BindingIndex.of(this.doc).boundTo(from)].filter(counts);
    this.write(() => {
      if (records.length > 0) this.doc.setTokenRecords(records);
      // Generators and scales now following `to` (or an alias moved to it) make their output again.
      for (const record of records) {
        if (record.kind === "generator" || record.kind === "scale") regenerate(this.doc, record);
        else if (record.kind === "variable") followBase(this.doc, record.id);
      }
      const patches = new Map<string, ElementPatch>();
      for (const id of layers) {
        const bindings = this.doc.get(id)?.bindings;
        if (!bindings) continue;
        // Paths stay (a text range's `runs.textStyle.<from>` too: its ranges then take `to`'s
        // look and the text module moves their style id); only what they're bound to changes.
        const next = Object.fromEntries(
          Object.entries(bindings).map(([path, token]) => [path, token === from ? to : token]),
        );
        patches.set(id, { bindings: next });
      }
      if (patches.size > 0) this.doc.updateMany(patches);
    });
    return layers.length;
  }

  /**
   * Unlinks every layer from these variables or styles (they keep what they show), one undo step;
   * the tokens stay. Styles using a detached variable keep the value it gave them.
   */
  detachTokens(ids: readonly string[], counts?: (elementId: string) => boolean): void {
    const store = this.store();
    const known = new Set(ids.filter((id) => store.variable(id) ?? store.style(id)));
    if (known.size === 0) return;
    this.write(() => {
      detachEverywhere(this.doc, known, counts);
      const unlinked = stylesWithout(store, known).filter((s) => !known.has(s.id));
      if (unlinked.length > 0) this.doc.setTokenRecords(unlinked);
    });
  }

  /**
   * Unlinks layers from their variables and styles (all of them, or only `tokenIds`), keeping
   * what they show; one undo step. Returns how many bindings went.
   */
  detachLayers(layerIds: readonly string[], tokenIds?: readonly string[]): number {
    const only = tokenIds ? new Set(tokenIds) : null;
    const patches = new Map<string, ElementPatch>();
    let count = 0;
    for (const id of layerIds) {
      const bindings = this.doc.get(id)?.bindings;
      if (!bindings) continue;
      const kept = Object.fromEntries(
        Object.entries(bindings).filter(([, token]) => only !== null && !only.has(token)),
      );
      const removed = Object.keys(bindings).length - Object.keys(kept).length;
      if (removed === 0) continue;
      count += removed;
      patches.set(id, { bindings: kept });
    }
    if (patches.size > 0) this.write(() => this.doc.updateMany(patches));
    return count;
  }
}

/** The document's variables (see `DocumentTokens`), one facade per engine or workspace. */
export const DOCUMENT_TOKENS = defineService("canvas.tokens", (doc) => new DocumentTokens(doc));
