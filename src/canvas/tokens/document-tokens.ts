import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import type { CanvasDocument } from "../document";
import { defineService } from "../services";
import { BindingIndex } from "./binding-index";
import { detachEverywhere } from "./detach-bindings";
import type {
  GeneratorInput,
  NewStyle,
  ScaleInput,
  SetValueOptions,
  StylePatch,
} from "./document-tokens.types";
import { orphanedGenerators, regenerate } from "./generator-writes";
import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";
import { TokenFeed } from "./token-feed";
import { normalizeTokenPath } from "./token-path";
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
    this.write(() => this.doc.setTokenRecords([next]), options.checkpoint ?? true);
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
    const orphans = orphanedGenerators(store, known);
    this.write(() => {
      if (orphans.length > 0) this.doc.setTokenRecords(orphans);
      detachEverywhere(this.doc, new Set(known));
      this.doc.removeTokenRecords(known);
    });
  }

  /** The ids of the elements bound to a variable or a style. */
  usage(id: string): string[] {
    return [...BindingIndex.of(this.doc).boundTo(id)];
  }
}

/** The document's variables (see `DocumentTokens`), one facade per engine or workspace. */
export const DOCUMENT_TOKENS = defineService("canvas.tokens", (doc) => new DocumentTokens(doc));
