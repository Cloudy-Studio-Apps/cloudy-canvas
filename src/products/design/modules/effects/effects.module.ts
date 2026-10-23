import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { someNodes } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { setEffectReader } from "../core";
import { designEffects } from "./design-effects";
import { EFFECT_TYPES, effectReader } from "./effect-args";
import {
  backgroundBlurRenderer,
  dropShadowRenderer,
  glassRenderer,
  innerShadowRenderer,
  layerBlurRenderer,
  noiseRenderer,
  textureRenderer,
} from "./renderers";
import { EFFECT_CATALOG, EffectsSection } from "./ui";
import { EffectHandles } from "./ui/handles";

/**
 * Effects, as in Figma's Effects section and further: inner and drop shadows, layer blur (even
 * or progressive), background blur, noise, texture and glass, drawn on the GPU over a layer and
 * what it holds; the Effects section with its editors; and what agents give in `effects`.
 */
export const effectsModule = defineModule({
  id: "effects",
  requires: ["core"],
  // Masks and effects nest along the tree; both read `treeSlots`.
  after: ["mask"],
  register(host) {
    host.contribute(designCanvas.effects, designEffects);
    host.contribute(
      designCanvas.effectRenderers,
      innerShadowRenderer,
      dropShadowRenderer,
      layerBlurRenderer,
      backgroundBlurRenderer,
      noiseRenderer,
      textureRenderer,
      glassRenderer,
    );
    for (const type of EFFECT_TYPES) setEffectReader(type, effectReader(type));

    host.contribute(designEditor.effectTypes, ...EFFECT_CATALOG);
    host.contribute(designEditor.overlays, { id: "effects.handles", component: EffectHandles });
    host.contribute(designEditor.propertySections, {
      id: "effects",
      tab: "design",
      order: 80,
      when: someNodes,
      component: EffectsSection,
    });
  },
});
