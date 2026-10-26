import { useMemo } from "react";

import type { ShaderEffect } from "@design";
import { CodeEditor } from "@shared/ui/components/code-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { compileShaderCode } from "../shader-compile";
import { paramValue } from "../shader-params";
import { SHADER_PRESETS } from "../shader-presets";
import { glslLanguage } from "./glsl-language";
import { ShaderParamField } from "./shader-param-field";
import type { EffectEditorProps } from "../../effects/ui";

/**
 * A shader effect's editor: a preset to start from, the code (GLSL, applied as it's typed; a
 * compile error is marked on its line and the layer is drawn without the shader meanwhile) and
 * a control for each parameter the code declares.
 */
export function ShaderEditor({ effect, onChange }: EffectEditorProps<ShaderEffect>) {
  const compiled = useMemo(() => compileShaderCode(effect.code), [effect.code]);
  const error = compiled.ok ? null : compiled.error;
  return (
    <div className="flex flex-col gap-2">
      <Select
        value=""
        onValueChange={(label) => {
          const preset = SHADER_PRESETS.find((p) => p.label === label);
          if (preset) onChange({ ...effect, code: preset.code, params: {} });
        }}
      >
        <SelectTrigger aria-label="Start from a preset" className="h-7 w-full text-xs">
          <SelectValue placeholder="Start from a preset…" />
        </SelectTrigger>
        <SelectContent>
          {SHADER_PRESETS.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CodeEditor
        value={effect.code}
        // Typing is one undo step per pause, like the board's code panels.
        onChange={(code) => onChange({ ...effect, code })}
        language={glslLanguage}
        label="Shader code"
        invalid={!!error}
        errorLine={error?.line ?? null}
        className="h-56 text-[11px]"
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
      {compiled.params.map((param) => (
        <ShaderParamField
          key={param.name}
          param={param}
          value={paramValue(param, effect.params[param.name])}
          onChange={(value, info) =>
            onChange(
              {
                ...effect,
                params: {
                  ...effect.params,
                  [param.name]: param.type === "float" ? value[0]! : value,
                },
              },
              info,
            )
          }
        />
      ))}
    </div>
  );
}
