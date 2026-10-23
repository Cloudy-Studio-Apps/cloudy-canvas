import {
  defaultFilterVert,
  Filter,
  GlProgram,
  Texture,
  UniformGroup,
  type TextureSource,
} from "pixi.js";

import type { EffectUniforms } from "./effect-shader.types";

/**
 * A fragment shader effects draw with (GLSL ES 3, Pixi's filter conventions: `vTextureCoord`,
 * `uTexture`, `finalColor`, and the global `uInputSize`, `uInputClamp`). Its uniforms are set
 * before each `EffectPass.run`, and `textures` names extra samplers (`uContent`, `uShadow`…)
 * bound with `bind`. One shader serves every scope: runs are drawn one at a time.
 */
export class EffectShader {
  readonly filter: Filter;
  private readonly group: UniformGroup;

  constructor(name: string, fragment: string, uniforms: EffectUniforms, textures: string[] = []) {
    this.group = new UniformGroup(uniforms);
    const samplers = Object.fromEntries(textures.map((key) => [key, Texture.EMPTY.source]));
    this.filter = new Filter({
      glProgram: GlProgram.from({
        vertex: defaultFilterVert,
        fragment,
        name: `effect-${name}`,
        // Positions in the layer and noise need the precision (and the vertex shader's uniforms
        // share it); devices without it fall back to medium.
        preferredFragmentPrecision: "highp",
      }),
      resources: { effectUniforms: this.group, ...samplers },
      resolution: "inherit",
      antialias: "inherit",
    });
  }

  /** Sets uniforms by name (numbers, or arrays for vectors). */
  set(values: Record<string, number | readonly number[]>): this {
    const uniforms = this.group.uniforms as Record<string, unknown>;
    for (const [key, value] of Object.entries(values)) {
      const current = uniforms[key];
      if (typeof value === "number") uniforms[key] = value;
      else if (current instanceof Float32Array) current.set(value);
      else uniforms[key] = Float32Array.from(value);
    }
    this.group.update();
    return this;
  }

  /** Binds textures to the shader's extra samplers. */
  bind(textures: Record<string, Texture>): this {
    const resources = this.filter.resources as Record<string, TextureSource>;
    for (const [key, texture] of Object.entries(textures)) resources[key] = texture.source;
    return this;
  }
}
