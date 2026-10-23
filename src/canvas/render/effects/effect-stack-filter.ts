import {
  Filter,
  Matrix,
  type Container,
  type FilterSystem,
  type RenderSurface,
  type Texture,
} from "pixi.js";

import type { CanvasEffect } from "../../effects";
import type { Rect } from "../../geometry.types";
import type { ScopeComposite } from "../layer-placement.types";
import { blendModeIndex, compositeShader } from "./composite-shader";
import { FilterEffectPass, NO_BACKDROP } from "./effect-pass";
import type { EffectRenderers, EffectStage } from "./effect-renderer.types";
import { copyShader } from "./effect-shaders";
import type { EffectStep } from "./effect-stack-filter.types";
import { effectsOutset } from "./effects-outset";

const STAGES: readonly EffectStage[] = ["backdrop", "content", "behind", "filter"];

/**
 * Every effect of one scope as one Pixi filter: Pixi renders the scope's content into a texture,
 * and `apply` runs the effects' renderers over it stage by stage (`EffectStage`), each from the
 * content as drawn and the result so far, then draws the result where the scope is, through
 * its composite (opacity and blend mode) when it has one.
 */
export class EffectStackFilter extends Filter {
  private steps: EffectStep[] = [];
  /** CSS pixels per world unit: the zoom on screen, 1 in exports. */
  private scale = 1;
  private rotation = 0;
  private box: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private outsetWorld = 0;
  /** The composite applied after the effects, or `null` when the result is drawn as it is. */
  private composite: ScopeComposite | null = null;

  /** `scope`: the container the filter is on, whose transform places the effects. */
  constructor(private readonly scope: Container) {
    super({ glProgram: copyShader.filter.glProgram, resolution: "inherit", antialias: "inherit" });
  }

  /**
   * Sets the effects (unknown types are skipped), the element's box and its turn, and the
   * composite the result is drawn with (`null`: as it is).
   */
  setEffects(
    effects: readonly CanvasEffect[],
    renderers: EffectRenderers,
    box: Rect,
    rotation: number,
    composite: ScopeComposite | null = null,
  ): void {
    this.box = box;
    const steps = effects.flatMap((effect) => {
      const renderer = renderers.get(effect.type);
      return effect.visible && renderer ? [{ effect, renderer }] : [];
    });
    this.steps = STAGES.flatMap((stage) => steps.filter((step) => step.renderer.stage === stage));
    this.rotation = rotation;
    this.composite =
      composite && (composite.opacity < 1 || composite.blendMode !== "normal") ? composite : null;
    this.blendRequired =
      (this.composite !== null && this.composite.blendMode !== "normal") ||
      this.steps.some(
        ({ effect, renderer }) => renderer.readsBackdrop?.(effect) ?? !!renderer.backdrop,
      );
    this.enabled = this.steps.length > 0 || this.composite !== null;
    const margin = Math.max(0, ...this.steps.map((s) => s.renderer.margin?.(s.effect) ?? 0));
    this.outsetWorld = Math.max(effectsOutset(effects, renderers), margin);
    this.updatePadding();
  }

  /** How far past the content the effects draw, in world units. */
  get outset(): number {
    return this.outsetWorld;
  }

  setScale(scale: number): void {
    if (scale === this.scale) return;
    this.scale = scale;
    this.updatePadding();
  }

  override apply(
    filters: FilterSystem,
    input: Texture,
    output: RenderSurface,
    clearMode: boolean,
  ): void {
    const backdrop = this.blendRequired ? (filters.activeBackTexture ?? NO_BACKDROP) : NO_BACKDROP;
    const pass = new FilterEffectPass(filters, input, backdrop, {
      scale: this.scale,
      rotation: this.rotation,
      box: this.box,
      origin: filterOrigin(filters),
      transform: this.scope.worldTransform ?? IDENTITY,
    });
    try {
      let current = input;
      for (const { effect, renderer } of this.steps) {
        current = renderer.render(pass, effect, current);
      }
      const composite = this.composite;
      if (composite) {
        compositeShader.bind({ uBackdrop: backdrop });
        compositeShader.set({
          uOpacity: composite.opacity,
          uMode: blendModeIndex(composite.blendMode),
        });
      }
      filters.applyFilter(
        (composite ? compositeShader : copyShader).filter,
        current,
        output,
        clearMode,
      );
    } finally {
      pass.release();
    }
  }

  private updatePadding(): void {
    // A pixel more than the effects reach, so soft edges fade out inside the texture.
    this.padding = Math.ceil(this.outsetWorld * this.scale) + 2;
  }
}

const IDENTITY = new Matrix();

/**
 * The corner of the area the filter system is drawing the active filter into. Pixi keeps it on
 * its (internal) filter data; without it, effects laid on the element are laid from the corner.
 */
function filterOrigin(filters: FilterSystem): { x: number; y: number } {
  const data = (
    filters as unknown as { _activeFilterData?: { bounds?: { minX: number; minY: number } } }
  )._activeFilterData;
  return { x: data?.bounds?.minX ?? 0, y: data?.bounds?.minY ?? 0 };
}
