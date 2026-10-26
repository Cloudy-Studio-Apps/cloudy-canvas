# Shader effect (Design module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Shader effect

- **Shader effect** (`shader-effect/`, Beta): GLSL code defining `vec4 effect(vec4 color, vec2 uv, vec2 local)` with the template's helpers (`current`, `content`, `behind`, `localAt`, `px`, `hash`, `valueNoise`, `uSize`, `uScale`; `shader-template.ts`); uniforms it declares become parameters by their note (`// @range min max default`, `@color #hex`, `@point x y`; `shaderParams`). `compileShaderCode` checks the code on a WebGL 2 context of its own first (errors mapped to the code's lines) and caches one `EffectShader` per text; code that fails draws nothing. Its editor: presets (`SHADER_PRESETS`), the `CodeEditor` with `glslLanguage` and the error line, and a field per parameter.
