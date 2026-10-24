import type { CanvasProduct } from "../canvas-product.types";
import type { CanvasDocument } from "../document";
import type { ExportHost } from "../export";
import type { Scene } from "../scene";

/** What an `ActorWorkspace` reaches of the engine it belongs to. */
export interface ActorWorkspaceHost<O extends object> {
  readonly product: CanvasProduct<O>;
  /** The document itself (the workspace writes through an actor view of it). */
  readonly doc: CanvasDocument;
  options(): O;
  /** The local user's view proportions (width / height), which collaborators' views keep. */
  viewAspect(): number;
  userSelection(): string[];
  /** What exports of `scene` reach (the renderer's off-screen snapshot). */
  exportHost(scene: Scene, selected: () => Iterable<string>): ExportHost;
  /** Copies elements of an export host to the system clipboard as a PNG. */
  copyPng(host: ExportHost, ids: readonly string[]): Promise<void>;
}
