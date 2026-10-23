/** How a shader parameter is edited: a slider, a color, a point in the layer, or plain numbers. */
export type ShaderParamKind = "range" | "color" | "point" | "number";

/**
 * A uniform the code declares, with what its note says (`// @range 0 1 0.5`, `// @color #ff0000`,
 * `// @point 0.5 0.5`): how it's edited and its default value.
 */
export interface ShaderParam {
  name: string;
  /** GLSL type. */
  type: "float" | "vec2" | "vec3" | "vec4";
  kind: ShaderParamKind;
  /** Values when nothing is set: one per component. */
  defaults: number[];
  /** A range's ends. */
  min?: number;
  max?: number;
}
