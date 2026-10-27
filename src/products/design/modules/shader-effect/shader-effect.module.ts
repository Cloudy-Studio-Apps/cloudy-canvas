import { WavesHorizontal } from "lucide-react";

import { defineModule } from "@shared/core";
import { designCanvas } from "../../design-points";
import { setEffectReader } from "../core";
import { createEffect, type ShaderEffect } from "../effects";
import { defineEffectType, designEffectTypes } from "../effects/ui";
import { DEFAULT_SHADER_CODE } from "./shader-defaults";
import { readShaderEffect } from "./shader-reader";
import { shaderRenderer } from "./shader.renderer";
import { ShaderEditor } from "./ui/shader-editor";
import { t } from "./shader-effect.i18n";
import * as shaderEffectApi from ".";

/**
 * The shader effect (Beta): a layer's look changed by GLSL code of one's own, with parameters
 * the code declares, presets to start from and errors shown on their line.
 */
export const shaderEffectModule = defineModule({
  id: "shader-effect",
  tier: "feature",
  requires: ["effects"],
  exports: { ...shaderEffectApi },
  register(host) {
    host.contribute(designCanvas.effectRenderers, shaderRenderer);
    setEffectReader("shader", readShaderEffect);
    host.contribute(
      designEffectTypes,
      defineEffectType<ShaderEffect>({
        type: "shader",
        label: t("title"),
        icon: WavesHorizontal,
        order: 100,
        beta: true,
        separated: true,
        create: () => ({ ...createEffect("shader"), code: DEFAULT_SHADER_CODE }),
        // Its first comment line names it ("Red and blue pulled apart…").
        summary: (effect) => {
          const first = effect.code.split("\n")[0] ?? "";
          return first.startsWith("//") ? first.slice(2).trim() : t("custom");
        },
        editor: ShaderEditor,
      }),
    );
  },
});
