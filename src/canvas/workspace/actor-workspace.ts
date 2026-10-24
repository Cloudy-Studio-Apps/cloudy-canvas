import type { Alignment, DistributeAxis, RotatePivot, ScaleAnchor } from "../arrange";
import { ElementClipboard, MemoryClipboard, PASTE_STEP } from "../clipboard";
import type { ElementClipboardHost } from "../clipboard";
import {
  actorDocument,
  type CanvasDocument,
  type DocumentHistory,
  type Placement,
} from "../document";
import type { CanvasElement, ElementKinds, ReorderDirection } from "../elements";
import { exportElements, type ExportOptions } from "../export";
import type { Point, Rect } from "../geometry.types";
import { ScopeGuides, type RulerGuide } from "../ruler-guides";
import { Scene } from "../scene";
import { ServiceCache, type ServiceDef } from "../services";
import { Emitter } from "../utils";
import { followEdit, showArea } from "./actor-viewport";
import type { ActorWorkspaceHost } from "./actor-workspace.types";
import {
  alignElements,
  applyStyleOf,
  canAlign,
  deleteElements,
  distributeElements,
  elementsBounds,
  removeElements,
  reorderElements,
  rotateElements,
  scaleElements,
  setLocked,
  tidyUpElements,
  withMembers,
  type WorkspaceParts,
} from "./operations";
import { productSceneHooks } from "./scene-hooks";
import type { CanvasWorkspace, WorkspaceInit } from "./workspace.types";

/**
 * A collaborator's own context on the document (an agent's): a headless scene of its scope, its
 * selection, its view and its undo history. Its edits are made as its actor (its transaction
 * origin, new elements placed in its scope), so what the local user shows, selects or undoes
 * never changes what it works on, and the other way round.
 */
export class ActorWorkspace<O extends object> implements CanvasWorkspace<O> {
  readonly doc: CanvasDocument;
  readonly kinds: ElementKinds<O>;
  /** This collaborator's undo history (its edits only). */
  readonly history: DocumentHistory;
  private readonly scene: Scene;
  private readonly services: ServiceCache;
  private readonly scopeGuides: ScopeGuides;
  private readonly clipboard: ElementClipboard<O>;
  private readonly changes = new Emitter();
  private readonly stopObserving: () => void;
  /** The document changed since the scene was last read. */
  private stale = true;
  private view: Rect;

  constructor(
    private readonly host: ActorWorkspaceHost<O>,
    origin: symbol,
    init: WorkspaceInit,
  ) {
    this.kinds = host.product.kinds;
    this.history = host.doc.createHistory(origin);
    this.scene = new Scene(host.doc, this.kinds, productSceneHooks(host.product));
    this.scene.scope = init.scope;
    this.view = init.viewport;
    this.doc = actorDocument(host.doc, {
      actor: () => ({ origin, placement: this.placement() }),
      history: this.history,
    });
    this.services = new ServiceCache(this.doc);
    this.scopeGuides = new ScopeGuides(this.doc, host.product.guides);
    this.clipboard = new ElementClipboard(this.clipboardHost(), new MemoryClipboard());
    this.stopObserving = host.doc.observe(() => {
      this.stale = true;
      this.scopeGuides.invalidate();
    });
  }

  // ── Reads ─────────────────────────────────────────────────────────────

  service<T>(def: ServiceDef<T>): T {
    return this.services.get(def);
  }

  options(): O {
    return this.host.options();
  }

  elements(): readonly CanvasElement[] {
    return this.fresh().elements;
  }

  getElement(id: string): CanvasElement | undefined {
    return this.fresh().get(id);
  }

  elementsBounds(ids: Iterable<string>): Rect | null {
    return elementsBounds(this.parts, ids);
  }

  contentBounds(): Rect | null {
    return this.fresh().contentBounds();
  }

  withMembers(ids: Iterable<string>, purpose: "move" | "delete"): Set<string> {
    return withMembers(this.parts, ids, purpose);
  }

  // ── Scope, selection and view ─────────────────────────────────────────

  get scope(): string | null {
    return this.scene.scope;
  }

  /** Works on another scope (a design's page); unknown ids are ignored. Clears the selection. */
  setScope(id: string): void {
    const { scopes } = this.host.product;
    if (id === this.scene.scope || !scopes?.list(this.host.doc).includes(id)) return;
    this.scene.scope = id;
    this.scene.selection.set([]);
    this.stale = true;
    this.changes.emit();
  }

  selectedIds(): string[] {
    this.fresh();
    return [...this.scene.selection.ids];
  }

  select(ids: Iterable<string>): void {
    const scene = this.fresh();
    if (scene.selection.set([...ids].filter((id) => scene.get(id)))) this.changes.emit();
  }

  userSelection(): string[] {
    return this.host.userSelection();
  }

  /** The world area this collaborator looks at, in the local user's view proportions. */
  get viewport(): Rect {
    return this.view;
  }

  /** Moves the view to what an edit changed, unless it's already well in view (see `followEdit`). */
  followEdit(bounds: Rect): void {
    this.setView(followEdit(this.view, bounds, this.host.viewAspect()));
  }

  zoomToFit(): void {
    const content = this.contentBounds();
    if (content) this.setView(showArea(content, this.host.viewAspect()));
  }

  /** Shows one element in the view and selects it. */
  zoomToElement(id: string): void {
    const bounds = this.elementsBounds([id]);
    if (!bounds) return;
    this.select([id]);
    this.setView(showArea(bounds, this.host.viewAspect()));
  }

  /** Fires when the scope, selection or view changes. Returns an unsubscribe function. */
  onChange(listener: () => void): () => void {
    return this.changes.subscribe(listener);
  }

  // ── Ruler guides ──────────────────────────────────────────────────────

  guides(): readonly RulerGuide[] {
    return this.scopeGuides.list(this.scene.scope);
  }

  addGuides(guides: readonly RulerGuide[]): void {
    this.setGuides([...this.guides(), ...guides]);
  }

  removeGuides(indexes?: Iterable<number>): void {
    const gone = indexes ? new Set(indexes) : null;
    const kept = gone ? this.guides().filter((_, i) => !gone.has(i)) : [];
    if (kept.length !== this.guides().length) this.setGuides(kept);
  }

  // ── Edits ─────────────────────────────────────────────────────────────

  deleteElements(ids: Iterable<string>): string[] {
    return deleteElements(this.parts, ids);
  }

  duplicateElements(
    ids: Iterable<string>,
    offset: Point = { x: PASTE_STEP, y: PASTE_STEP },
  ): Map<string, string> {
    return this.clipboard.duplicate([...ids], offset);
  }

  reorderElements(ids: Iterable<string>, direction: ReorderDirection): string[] {
    return reorderElements(this.parts, ids, direction);
  }

  setLocked(ids: Iterable<string>, locked: boolean): string[] {
    return setLocked(this.parts, ids, locked);
  }

  alignElements(ids: Iterable<string>, alignment: Alignment): string[] {
    return alignElements(this.parts, ids, alignment);
  }

  distributeElements(ids: Iterable<string>, axis: DistributeAxis): string[] {
    return distributeElements(this.parts, ids, axis);
  }

  tidyUpElements(ids: Iterable<string>): string[] {
    return tidyUpElements(this.parts, ids);
  }

  canAlign(ids: Iterable<string>): boolean {
    return canAlign(this.parts, ids);
  }

  scaleElements(ids: Iterable<string>, factor: number, anchor?: ScaleAnchor): string[] {
    return scaleElements(this.parts, ids, factor, anchor);
  }

  rotateElements(
    ids: Iterable<string>,
    degrees: number | ((el: CanvasElement) => number),
    around?: RotatePivot,
  ): string[] {
    return rotateElements(this.parts, ids, degrees, around);
  }

  applyStyleOf(fromId: string, ids: Iterable<string>): string[] {
    return applyStyleOf(this.parts, fromId, ids);
  }

  // ── Exports and history ───────────────────────────────────────────────

  exportElements(options: ExportOptions): Promise<Blob> {
    return exportElements(this.exportHost(), options);
  }

  copyAsPng(ids?: readonly string[]): Promise<void> {
    return this.host.copyPng(this.exportHost(), ids ?? this.selectedIds());
  }

  undo(): void {
    this.history.undo();
  }

  redo(): void {
    this.history.redo();
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  destroy(): void {
    this.stopObserving();
    this.history.destroy();
    this.changes.clear();
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /** The scene, read again from the document when it changed since. */
  private fresh(): Scene {
    if (!this.stale) return this.scene;
    this.stale = false;
    this.scene.refresh();
    const { selection } = this.scene;
    selection.set([...selection.ids].filter((id) => this.scene.get(id)));
    return this.scene;
  }

  private get parts(): WorkspaceParts<O> {
    return { doc: this.doc, kinds: this.kinds, product: this.host.product, scene: this.fresh() };
  }

  /** New elements land in this workspace's scope. */
  private placement(): Placement | null {
    const { scopes } = this.host.product;
    const scope = this.scene.scope;
    return scopes && scope !== null ? (el) => scopes.place(el, scope) : null;
  }

  private setView(view: Rect): void {
    this.view = view;
    this.changes.emit();
  }

  private setGuides(guides: readonly RulerGuide[]): void {
    if (!this.scopeGuides.kept) return;
    this.doc.checkpoint();
    this.scopeGuides.write(this.scene.scope, guides);
  }

  private exportHost() {
    return this.host.exportHost(this.fresh(), () => this.scene.selection.ids);
  }

  private clipboardHost(): ElementClipboardHost<O> {
    return {
      product: this.host.product,
      doc: this.doc,
      elements: () => this.elements(),
      getElement: (id) => this.getElement(id),
      withMembers: (ids) => this.withMembers(ids, "move"),
      visibleRect: () => this.view,
      getOptions: () => this.host.options(),
      select: (ids) => this.select(ids),
      selected: () => this.selectedIds(),
      remove: (ids) => void removeElements(this.parts, ids),
    };
  }
}
