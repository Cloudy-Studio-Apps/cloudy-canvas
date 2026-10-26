import {
  defineService,
  Emitter,
  TokenStore,
  type CanvasDocument,
  type ElementPatch,
  type Point,
} from "@canvas";

import { isDesignNode } from "../../core";
import {
  createSheet,
  generatedMark,
  isSheet,
  safeGroups,
  type SheetModeView,
  type StyleguideSettings,
  type SystemPage,
  type TemplateChoice,
  type TokenSheet,
} from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { ensureSystemPage, orderedCategories, settingsOf, systemPageOf } from "../system";
import { convertSheets } from "./convert-sheet";
import type { StyleguideOutlineEntry } from "./design-styleguide.types";

/** Where a new element goes when no point is given: this far right of the page's content. */
const PLACE_GAP = 200;

/**
 * The Design system's settings and live elements, and the only place that edits them (each edit
 * is one undo step; the sync regenerates in it). Observes the document only while something
 * subscribes (`subscribe`/`getVersion` for `useSyncExternalStore`), so it needs no cleanup.
 */
export class DesignStyleguide {
  private readonly emitter = new Emitter();
  private version = 0;
  private listeners = 0;
  private stop: (() => void) | null = null;

  constructor(private readonly doc: CanvasDocument) {}

  subscribe = (listener: () => void): (() => void) => {
    const off = this.emitter.subscribe(listener);
    if (this.listeners++ === 0) {
      this.version++;
      const bump = () => {
        this.version++;
        this.emitter.emit();
      };
      const offElements = this.doc.observe((change) => {
        const systemId = systemPageOf(this.doc)?.id;
        for (const id of change.updated) {
          if (id === systemId || isSheet(this.doc.get(id))) return bump();
        }
        if (change.removed.size > 0) bump();
      });
      const offTokens = this.doc.observeTokens(bump);
      this.stop = () => {
        offElements();
        offTokens();
      };
    }
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      off();
      if (--this.listeners > 0) return;
      this.stop?.();
      this.stop = null;
    };
  };

  getVersion = (): number => this.version;

  /** The system page, while the file has tokens. */
  page(): SystemPage | undefined {
    return systemPageOf(this.doc);
  }

  settings(): StyleguideSettings {
    return settingsOf(this.page());
  }

  /** The categories in the view's order, with their groups and whether they're shown. */
  outline(categories: readonly StyleguideCategory[]): StyleguideOutlineEntry[] {
    const store = TokenStore.of(this.doc);
    const page = this.page();
    const settings = settingsOf(page);
    const sheets = page
      ? this.doc
          .all()
          .filter(isSheet)
          .filter((sheet) => sheet.pageId === page.id && sheet.parentId === null)
      : [];
    return orderedCategories(categories, settings).map((category) => ({
      category,
      groups: safeGroups(category, store, this.doc),
      sheetId: sheets.find((sheet) => sheet.sheet.category === category.id)?.id,
      hidden: settings.hidden.includes(category.id),
    }));
  }

  /** The view's category order. */
  setOrder(order: readonly string[]): void {
    this.patchSettings({ order: [...order] });
  }

  /** Shows or hides a category (`"colors"`) or a group (`"colors:<id>"`) in the view. */
  setHidden(key: string, hidden: boolean): void {
    const current = this.settings().hidden.filter((other) => other !== key);
    this.patchSettings({ hidden: hidden ? [...current, key] : current });
  }

  /** A category's default template (`"colors"`) or a group's override; `null` clears it. */
  setChoice(key: string, choice: TemplateChoice | null): void {
    const choices = { ...this.settings().choices };
    if (choice) choices[key] = choice;
    else delete choices[key];
    this.patchSettings({ choices });
  }

  /** Whether the view shows every mode side by side. */
  setModeView(modeView: SheetModeView): void {
    this.patchSettings({ modeView });
  }

  /** Changes what a live element shows or how. */
  setSheet(
    id: string,
    patch: Partial<Pick<TokenSheet, "category" | "group" | "template" | "options" | "modeView">>,
  ): void {
    const el = this.doc.get(id);
    if (!isSheet(el)) return;
    const sheet: TokenSheet = { ...el.sheet, ...patch };
    if ("group" in patch && !patch.group) delete sheet.group;
    this.doc.checkpoint();
    this.doc.update(id, { sheet } as ElementPatch);
  }

  /**
   * Adds a live element of `source` to a page (the user's), at `at` or right of the page's
   * content, and returns its id.
   */
  addSheet(
    pageId: string,
    source: Pick<TokenSheet, "category" | "group">,
    name: string,
    at?: Point,
    look?: Partial<Pick<TokenSheet, "template" | "options" | "modeView">>,
  ): string {
    const sheet = createSheet(
      source,
      name,
      at ?? this.freeSpot(pageId),
      this.doc.nextIndex(),
      null,
      look,
    );
    this.doc.checkpoint();
    this.doc.add({ ...sheet, pageId } as typeof sheet);
    return sheet.id;
  }

  /**
   * Makes the system page of a file whose tokens came before it (one undo step; the sync draws
   * it). Files get it with their first token otherwise.
   */
  setup(categories: readonly StyleguideCategory[]): void {
    if (this.page()) return;
    this.doc.checkpoint();
    this.doc.batch(() => ensureSystemPage(this.doc, TokenStore.of(this.doc), categories));
  }

  /** Converts live elements into ordinary layers (see `convertSheets`); returns their ids. */
  convert(ids: readonly string[]): string[] {
    this.doc.checkpoint();
    return convertSheets(this.doc, ids);
  }

  /** Whether a layer was generated by a live element (it isn't edited on its own). */
  isGenerated(id: string): boolean {
    return generatedMark(this.doc.get(id)) !== null;
  }

  private freeSpot(pageId: string): Point {
    const top = this.doc
      .all()
      .filter((el) => isDesignNode(el) && el.pageId === pageId && el.parentId === null);
    if (top.length === 0) return { x: 0, y: 0 };
    const right = Math.max(...top.map((el) => el.x + el.w));
    const y = Math.min(...top.map((el) => el.y));
    return { x: Math.round(right + PLACE_GAP), y: Math.round(y) };
  }

  private patchSettings(patch: Partial<StyleguideSettings>): void {
    const page = this.page();
    if (!page) return;
    this.doc.checkpoint();
    this.doc.update(page.id, { styleguide: { ...settingsOf(page), ...patch } } as ElementPatch);
  }
}

/** The Design system's settings and live elements (`engine.service(DESIGN_STYLEGUIDE)`). */
export const DESIGN_STYLEGUIDE = defineService(
  "design.styleguide",
  (doc) => new DesignStyleguide(doc),
);
