import type { Alignment, DistributeAxis, RotatePivot, ScaleAnchor } from "../arrange";
import type { CanvasDocument, UndoHistory } from "../document";
import type { CanvasElement, ElementKinds, ReorderDirection } from "../elements";
import type { ExportOptions } from "../export";
import type { Point, Rect } from "../geometry.types";
import type { RulerGuide } from "../ruler-guides";
import type { ServiceDef } from "../services";

/**
 * One collaborator's context on a document: what they see (their scope, a design's page), what
 * they've selected, their view and their undo history. The engine is the local user's; each
 * other collaborator (an agent) gets an `ActorWorkspace` (`CanvasEngine.workspace`), so they
 * keep editing their page whatever the user does. Agent tools take one of these.
 */
export interface CanvasWorkspace<O extends object = object> {
  /** The document as this collaborator writes it (its edits go to its own history). */
  readonly doc: CanvasDocument;
  readonly kinds: ElementKinds<O>;
  /** A document facade (see `defineService`), made once per workspace on its document. */
  service<T>(def: ServiceDef<T>): T;
  /** The product's tool options (what new elements look like). */
  options(): O;

  // Elements of the workspace's scope, with derived geometry resolved.
  elements(): readonly CanvasElement[];
  getElement(id: string): CanvasElement | undefined;
  elementsBounds(ids: Iterable<string>): Rect | null;
  contentBounds(): Rect | null;
  withMembers(ids: Iterable<string>, purpose: "move" | "delete"): Set<string>;

  // Scope and selection.
  readonly scope: string | null;
  setScope(id: string): void;
  selectedIds(): string[];
  select(ids: Iterable<string>): void;
  /** What the local user has selected, whoever's workspace this is. */
  userSelection(): string[];

  // Ruler guides of the scope.
  guides(): readonly RulerGuide[];
  addGuides(guides: readonly RulerGuide[]): void;
  removeGuides(indexes?: Iterable<number>): void;

  // Edits, each one undo step in this workspace's history.
  deleteElements(ids: Iterable<string>): string[];
  duplicateElements(ids: Iterable<string>, offset?: Point): Map<string, string>;
  reorderElements(ids: Iterable<string>, direction: ReorderDirection): string[];
  setLocked(ids: Iterable<string>, locked: boolean): string[];
  alignElements(ids: Iterable<string>, alignment: Alignment): string[];
  distributeElements(ids: Iterable<string>, axis: DistributeAxis): string[];
  tidyUpElements(ids: Iterable<string>): string[];
  canAlign(ids: Iterable<string>): boolean;
  scaleElements(ids: Iterable<string>, factor: number, anchor?: ScaleAnchor): string[];
  rotateElements(
    ids: Iterable<string>,
    degrees: number | ((el: CanvasElement) => number),
    around?: RotatePivot,
  ): string[];
  applyStyleOf(fromId: string, ids: Iterable<string>): string[];

  // View.
  exportElements(options: ExportOptions): Promise<Blob>;
  copyAsPng(ids?: readonly string[]): Promise<void>;
  zoomToFit(): void;
  zoomToElement(id: string): void;

  // History.
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

/** What an `ActorWorkspace` starts with: the scope and view it opens on. */
export interface WorkspaceInit {
  scope: string | null;
  viewport: Rect;
}

/** An undo history someone else may step through, and whose it is (`CanvasEngine.setHistoryTarget`). */
export interface HistoryTarget {
  /** Whose history it is, for labels ("Undo Claude Code's change"). */
  owner: string;
  history: UndoHistory;
}
