import { Sparkles } from "lucide-react";

import { defineModule } from "@shared/core";
import { createNodeStyle, designStyleTypes } from "../core/ui";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { someNodes } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import {
  EFFECT_STYLE,
  effectBindingsOf,
  effectStyleOfNode,
  effectStyleSummary,
  setEffectReader,
} from "../core";
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
import { EffectStyleEditor, EffectStylePreview } from "./ui/styles";
import { designEffectTypes } from "./ui/effects.points";
import { t } from "./effects.i18n";
import * as effectsApi from ".";
import * as effectsUi from "./ui";

/**
 * Effects, as in Figma's Effects section and further: inner and drop shadows, layer blur (even
 * or progressive), background blur, noise, texture and glass, drawn on the GPU over a layer and
 * what it holds; the Effects section with its editors; and what agents give in `effects`.
 */
export const effectsModule = defineModule({
  id: "effects",
  tier: "core",
  requires: ["core"],
  // Masks and effects nest along the tree; both read `treeSlots`.
  after: ["mask"],
  exports: { ...effectsApi, ...effectsUi },
  register(host) {
    host.contribute(designStyleTypes, {
      id: EFFECT_STYLE,
      label: t("style.label"),
      heading: t("style.heading"),
      icon: Sparkles,
      order: 30,
      create: (engine) =>
        createNodeStyle(engine, EFFECT_STYLE, effectStyleOfNode, effectBindingsOf),
      Preview: EffectStylePreview,
      summary: effectStyleSummary,
      Editor: EffectStyleEditor,
    });
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

    host.contribute(designEffectTypes, ...EFFECT_CATALOG);
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
