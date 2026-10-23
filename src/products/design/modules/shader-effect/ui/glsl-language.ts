import { StreamLanguage } from "@codemirror/language";

const KEYWORDS = new Set([
  "uniform",
  "const",
  "in",
  "out",
  "inout",
  "return",
  "if",
  "else",
  "for",
  "while",
  "break",
  "continue",
  "discard",
  "struct",
  "precision",
  "highp",
  "mediump",
  "lowp",
]);
const TYPES = new Set([
  "void",
  "bool",
  "int",
  "float",
  "vec2",
  "vec3",
  "vec4",
  "ivec2",
  "ivec3",
  "ivec4",
  "bvec2",
  "bvec3",
  "bvec4",
  "mat2",
  "mat3",
  "mat4",
  "sampler2D",
]);
const BUILTINS = new Set([
  "abs",
  "sign",
  "floor",
  "ceil",
  "fract",
  "mod",
  "min",
  "max",
  "clamp",
  "mix",
  "step",
  "smoothstep",
  "length",
  "distance",
  "dot",
  "cross",
  "normalize",
  "reflect",
  "refract",
  "pow",
  "exp",
  "log",
  "sqrt",
  "inversesqrt",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "texture",
  "current",
  "content",
  "behind",
  "localAt",
  "px",
  "hash",
  "valueNoise",
  "effect",
]);

/** Syntax colors for shader effect code (GLSL), with the template's helpers as built-ins. */
export const glslLanguage = StreamLanguage.define<{ comment: boolean }>({
  name: "glsl",
  startState: () => ({ comment: false }),
  token(stream, state) {
    if (state.comment) {
      if (stream.match(/.*?\*\//)) state.comment = false;
      else stream.skipToEnd();
      return "comment";
    }
    if (stream.eatSpace()) return null;
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match("/*")) {
      state.comment = true;
      return "comment";
    }
    if (stream.match(/^#\w+/)) return "meta";
    if (stream.match(/^\d*\.?\d+(e[+-]?\d+)?/i)) return "number";
    const word = stream.match(/^[A-Za-z_]\w*/) as RegExpMatchArray | null;
    if (word) {
      const text = word[0];
      if (KEYWORDS.has(text)) return "keyword";
      if (TYPES.has(text)) return "typeName";
      if (BUILTINS.has(text)) return "builtin";
      return /^u[A-Z]/.test(text) ? "propertyName" : "variableName";
    }
    stream.next();
    return /[{}()[\]]/.test(stream.current()) ? "bracket" : "operator";
  },
});
