import type { CanvasDocument } from "../document";
import type { CanvasGuides, RulerGuide } from "./ruler-guides.types";

const NONE: readonly RulerGuide[] = [];

/**
 * The ruler guides of the scope on screen, read through the product's `CanvasGuides` once per
 * document change (the renderer asks every frame).
 */
export class ScopeGuides {
  private cached: { scope: string | null; guides: readonly RulerGuide[] } | null = null;

  constructor(
    private readonly doc: CanvasDocument,
    private readonly hook: CanvasGuides | undefined,
  ) {}

  /** Whether the product keeps guides at all. */
  get kept(): boolean {
    return this.hook !== undefined;
  }

  list(scope: string | null): readonly RulerGuide[] {
    if (!this.hook) return NONE;
    if (this.cached?.scope !== scope)
      this.cached = { scope, guides: this.hook.read(this.doc, scope) };
    return this.cached.guides;
  }

  /** Replaces the scope's guides, in the current undo step. */
  write(scope: string | null, guides: readonly RulerGuide[]): void {
    if (!this.hook) return;
    this.hook.write(this.doc, scope, guides);
    this.cached = null;
  }

  /** Reads them again next time (the document changed). */
  invalidate(): void {
    this.cached = null;
  }
}
