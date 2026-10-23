import { Container, Graphics } from "pixi.js";

import { rectsIntersect } from "../../geometry";
import { rotatePoint } from "../../rotation";
import { clipCovers } from "../clip-covers";
import type { Rect } from "../../geometry.types";
import { EffectStackFilter } from "../effects/effect-stack-filter";
import type { EffectRenderers } from "../effects/effect-renderer.types";
import type { EffectScope, ElementClip } from "../layer-placement.types";

/** The clip's outline: stacked first among the scope's children. */
class ClipGraphics extends Graphics {
  readonly order = "";
}

/**
 * One element's effects on the canvas: a container holding the element's view and the views (and
 * nested scopes) of what it holds, drawn through one `EffectStackFilter`, then composited with its
 * opacity and blend mode. A scope with only an opacity whose parts don't overlap needs no filter:
 * its opacity is the container's alpha. It sits where the element is in the drawing order, in the
 * layer or an enclosing scope.
 */
export class EffectScopeView extends Container {
  /** The element's drawing order key. */
  order = "";
  private readonly stack = new EffectStackFilter(this);
  private bounds: Rect = { x: 0, y: 0, w: 0, h: 0 };
  /** The effects as last applied, so unchanged ones aren't set up again. */
  private applied = "";
  private clipMask: ClipGraphics | null = null;
  /** The clip as last set, with the reach it was checked against. */
  private clipped = "";

  constructor(readonly elementId: string) {
    super();
    this.filters = [this.stack];
  }

  /** How far past what it holds the effects draw, in world units. */
  get outset(): number {
    return this.stack.outset;
  }

  apply(scope: EffectScope, renderers: EffectRenderers): void {
    this.bounds = scope.bounds;
    const { box, rotation, composite } = scope;
    const look = `${rotation}|${box.x},${box.y},${box.w},${box.h}|${JSON.stringify(scope.effects)}|${JSON.stringify(composite ?? null)}`;
    if (look === this.applied) return;
    this.applied = look;
    // Opacity alone over parts that don't overlap is the same handed down as alpha.
    const handedDown =
      !!composite &&
      !composite.isolated &&
      composite.blendMode === "normal" &&
      !scope.effects.some((effect) => effect.visible && renderers.has(effect.type));
    this.alpha = handedDown ? composite.opacity : 1;
    this.stack.setEffects(scope.effects, renderers, box, rotation, handedDown ? null : composite);
  }

  /**
   * Clips the effects to the area the element is clipped to (a shadow inside a frame that clips
   * its content stays inside it), unless they lie within it.
   */
  setClip(clip: ElementClip | null): void {
    const key = `${JSON.stringify(clip)}|${JSON.stringify(this.bounds)}|${this.stack.outset}`;
    if (key === this.clipped) return;
    this.clipped = key;
    if (this.clipMask) {
      this.mask = null;
      this.clipMask.destroy();
      this.clipMask = null;
    }
    const reach = this.stack.outset;
    if (!clip || clipCovers(clip, grow(this.bounds, reach))) return;
    const g = new ClipGraphics();
    const { x, y, w, h } = clip.rect;
    const turn = clip.rotation ?? 0;
    if (turn === 0) {
      const radius = Math.min(clip.radius, w / 2, h / 2);
      if (radius > 0) g.roundRect(x, y, w, h, radius);
      else g.rect(x, y, w, h);
    } else {
      const corners = [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ].map((p) => rotatePoint(p, clip.rect, turn));
      g.poly(corners.flatMap((p) => [p.x, p.y]));
    }
    g.fill({ color: 0xffffff });
    this.addChildAt(g, 0);
    this.clipMask = g;
    this.mask = g;
  }

  /** CSS pixels per world unit the effects are drawn at (the zoom). */
  setScale(scale: number): void {
    this.stack.setScale(scale);
  }

  /** Skips drawing the scope while it and its effects are outside `visible` (a world rect). */
  cull(visible: Rect): void {
    const shown = rectsIntersect(grow(this.bounds, this.stack.outset), visible);
    if (this.culled === shown) this.culled = !shown;
  }
}

function grow(rect: Rect, by: number): Rect {
  return { x: rect.x - by, y: rect.y - by, w: rect.w + by * 2, h: rect.h + by * 2 };
}
