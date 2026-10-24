import type { CanvasProduct } from "../../canvas-product.types";
import type { CanvasDocument } from "../../document";
import type { ElementKinds } from "../../elements";
import type { Scene } from "../../scene";

/**
 * What the operations every workspace shares (the user's engine, a collaborator's workspace)
 * work on: the document they write to, the scene they read (with derived geometry, in their
 * scope) and the product's kinds and hooks.
 */
export interface WorkspaceParts<O extends object = object> {
  readonly doc: CanvasDocument;
  readonly kinds: ElementKinds<O>;
  readonly product: CanvasProduct<O>;
  readonly scene: Scene;
}
