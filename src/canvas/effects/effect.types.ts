/**
 * One effect on an element (a shadow, a blur, a shader): plain JSON stored with it. `type` names
 * the product's `EffectRenderer` that draws it; the rest is the renderer's own fields. The set of
 * types is open, like elements'.
 */
export interface CanvasEffect {
  /** Stable across edits (panels key their rows by it). */
  id: string;
  type: string;
  visible: boolean;
}
