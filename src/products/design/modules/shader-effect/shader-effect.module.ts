import { WavesHorizontal } from "lucide-react";

import { defineModule } from "@shared/core";
import { defineEffectType } from "@design/ui/modules/define-effect-type";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { createEffect, type ShaderEffect } from "../effects";
import { shaderRenderer } from "./shader.renderer";
import { ShaderEditor } from "./ui/shader-editor";

/**
 * The shader effect (Beta): a layer's look changed by GLSL code of one's own, with parameters
 * the code declares, presets to start from and errors shown on their line.
 */
export const shaderEffectModule = defineModule({
  id: "shader-effect",
  requires: ["effects"],
  register(host) {
    host.contribute(designCanvas.effectRenderers, shaderRenderer);
    host.contribute(
      designEditor.effectTypes,
      defineEffectType<ShaderEffect>({
        type: "shader",
        label: "Shader",
        icon: WavesHorizontal,
        order: 100,
        beta: true,
        separated: true,
        create: () => createEffect("shader"),
        // Its first comment line names it ("Red and blue pulled apart…").
        summary: (effect) => {
          const first = effect.code.split("\n")[0] ?? "";
          return first.startsWith("//") ? first.slice(2).trim() : "Custom";
        },
        editor: ShaderEditor,
      }),
    );
  },
});
