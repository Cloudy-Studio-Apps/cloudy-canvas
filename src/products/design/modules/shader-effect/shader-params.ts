import type { ShaderParam } from "./shader-params.types";

const UNIFORM = /^\s*uniform\s+(float|vec2|vec3|vec4)\s+(\w+)\s*;\s*(?:\/\/\s*@(\w+)([^\n]*))?$/gm;

const SIZES = { float: 1, vec2: 2, vec3: 3, vec4: 4 } as const;

/** Names the template gives; code can't declare them again. */
export const RESERVED_UNIFORMS = new Set([
  "uTexture",
  "uContent",
  "uBehind",
  "uInputSize",
  "uInputClamp",
  "uLocalX",
  "uLocalY",
  "uSize",
  "uScale",
]);

/**
 * The parameters a shader's code declares: each `uniform float|vec2|vec3|vec4 name;` with an
 * optional note on its line. `@range min max default` makes a float slider, `@color #rrggbb` a
 * color (vec3, or vec4 with opacity), `@point x y` a point in the layer (0–1 each); others are
 * plain numbers starting at 0.
 */
export function shaderParams(code: string): ShaderParam[] {
  const params: ShaderParam[] = [];
  for (const match of code.matchAll(UNIFORM)) {
    const [, type, name, note, rest = ""] = match as unknown as [
      string,
      ShaderParam["type"],
      string,
      string | undefined,
      string | undefined,
    ];
    if (RESERVED_UNIFORMS.has(name)) continue;
    const size = SIZES[type];
    const numbers = rest
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const zeros = Array.from({ length: size }, () => 0);
    if (note === "range" && type === "float") {
      const [min = 0, max = 1, value = min] = numbers;
      params.push({ name, type, kind: "range", min, max, defaults: [value] });
    } else if (note === "color" && (type === "vec3" || type === "vec4")) {
      const rgb = hexChannels(rest.trim()) ?? [1, 1, 1];
      params.push({ name, type, kind: "color", defaults: type === "vec4" ? [...rgb, 1] : rgb });
    } else if (note === "point" && type === "vec2") {
      const [x = 0.5, y = 0.5] = numbers;
      params.push({ name, type, kind: "point", defaults: [x, y] });
    } else {
      const values = zeros.map((zero, i) => (Number.isFinite(numbers[i]) ? numbers[i]! : zero));
      params.push({ name, type, kind: "number", defaults: values });
    }
  }
  return params;
}

/** A param's value as the shader takes it: what's set (sized right), else its default. */
export function paramValue(param: ShaderParam, set: number | number[] | undefined): number[] {
  const given = set === undefined ? [] : Array.isArray(set) ? set : [set];
  return param.defaults.map((value, i) => (Number.isFinite(given[i]) ? given[i]! : value));
}

function hexChannels(text: string): [number, number, number] | null {
  const match = /#?([0-9a-f]{6})/i.exec(text);
  if (!match) return null;
  const value = parseInt(match[1]!, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
