# Shader effect

A Beta effect type: a layer's look changed by GLSL code of one's own, with the parameters the code declares and presets to start from. It's the model for adding an effect type from outside the effects module.

- **Tier:** feature
- **Requires:** effects
- **Contributes:** designCanvas: `effectRenderers`; `designEffectTypes`; the `shader` agent reader (`setEffectReader`)
- **Points it owns:** —
- **MCP tools:** —
- **Exports:** `DEFAULT_SHADER_CODE`.
- **Files:** `shader-defaults.ts`, `shader-reader.ts`, `shader.renderer.ts`, `shader-compile.ts`, `shader-params.ts`, `shader-presets.ts`, `shader-template.ts`, `ui/` (the editor).

## How it works

- **Shader effect** (`shader-effect/`, Beta): GLSL code defining `vec4 effect(vec4 color, vec2 uv, vec2 local)` with the template's helpers (`current`, `content`, `behind`, `localAt`, `px`, `hash`, `valueNoise`, `uSize`, `uScale`; `shader-template.ts`); uniforms it declares become parameters by their note (`// @range min max default`, `@color #hex`, `@point x y`; `shaderParams`). `compileShaderCode` checks the code on a WebGL 2 context of its own first (errors mapped to the code's lines) and caches one `EffectShader` per text; code that fails draws nothing. Its editor: presets (`SHADER_PRESETS`), the `CodeEditor` with `glslLanguage` and the error line, and a field per parameter.
- **Starting code:** `DEFAULT_SHADER_CODE` (a vignette that shows what the code can use) is this module's, not the effects module's: a new shader effect from the menu gets it in `create`, and one an agent gives without `code` gets it from `readShaderEffect` (the effects module's `effectReader("shader")` plus the default), which replaces the effects module's reader for `shader`.
