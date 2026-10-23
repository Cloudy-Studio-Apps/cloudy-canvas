/** An effect shader's uniforms, as Pixi's `UniformGroup` takes them. */
export type EffectUniforms = Record<
  string,
  { value: number | Float32Array; type: "f32" | "i32" | "vec2<f32>" | "vec3<f32>" | "vec4<f32>" }
>;
