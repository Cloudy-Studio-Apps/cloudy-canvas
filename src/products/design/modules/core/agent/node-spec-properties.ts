import { LAYER_BLEND_MODES } from "../node";

const PAINTS = {
  type: "array",
  description:
    'Paints bottom to top: { type: "solid", color: "#RRGGBB", opacity?: 0–1, visible? }; a ' +
    'gradient { type: "linear" | "radial" | "angular" | "diamond", stops: [{ position: 0–1, ' +
    'color, opacity?, ease?: "linear" | "ease-in" | "ease-out" | "ease-in-out" }] (two or more), ' +
    "angle? (linear only, CSS degrees: 0 up, 90 right; default top to bottom), or from?/to?/width? " +
    "handles as points of the layer's box (0–1 each axis; radial/angular/diamond: from is the " +
    'center, to the radius end), interpolation?: "srgb" | "oklab" (smoother middles), opacity?, ' +
    'visible? }; a CSS gradient string ("linear-gradient(90deg, #FF5F6D, #FFC371)", ' +
    'radial-gradient, conic-gradient); or { type: "image", assetId, scaleMode?: "fill" | "fit" | ' +
    '"crop" | "tile", crop?: { x, y, w, h } (crop: the part of the picture shown, fractions of it), ' +
    "scalingFactor? (tile: a tile's size as a share of the picture's pixels, default 0.5), " +
    "rotation?: 0 | 90 | 180 | 270 (fill, fit, tile: clockwise), opacity?, visible? } (fills only). " +
    'Any paint may give blendMode ("multiply", "screen", "overlay"…; default "normal").',
  items: { type: "object" },
};

/** What every layer's spec takes in `create_nodes`; kinds add theirs (`specProperties`). */
export const NODE_SPEC_PROPERTIES = {
  key: {
    type: "string",
    description:
      "Name to find this layer in the result, or to use it as a parent in the same call.",
  },
  x: { type: "number" },
  y: { type: "number" },
  w: { type: "number" },
  h: { type: "number" },
  name: {
    type: "string",
    description: 'Layer name (default: "Rectangle 3", a text\'s first line).',
  },
  parent: {
    type: ["string", "null"],
    description:
      "Frame or section to put it in (id, or key from this call); null for the top of the page. " +
      "Default: the one under its center.",
  },
  fill: {
    type: "string",
    description: 'One fill: a color, a CSS gradient ("linear-gradient(…)"), or "transparent".',
  },
  fills: PAINTS,
  stroke: {
    type: "string",
    description: 'One stroke: a color, a CSS gradient, or "transparent" for none.',
  },
  strokes: PAINTS,
  strokeWeight: { type: "number" },
  strokeAlign: {
    type: "string",
    enum: ["inside", "center", "outside"],
    description: "Where strokes sit on a closed outline (new shapes: inside; lines: center).",
  },
  strokeCap: { type: "string", enum: ["none", "round", "square"], description: "Ends and dashes." },
  strokeJoin: { type: "string", enum: ["miter", "bevel", "round"], description: "Corners." },
  strokeMiterAngle: {
    type: "number",
    description: "Corners sharper than this many degrees are beveled (default 28.96).",
  },
  strokeDashes: {
    type: "array",
    items: { type: "number" },
    description: "Dash, gap, … lengths, e.g. [8, 4]; [] for a solid stroke.",
  },
  strokeWeights: {
    type: ["object", "null"],
    properties: {
      top: { type: "number" },
      right: { type: "number" },
      bottom: { type: "number" },
      left: { type: "number" },
    },
    description: "Rectangles and frames: a stroke weight per side; null for one weight.",
  },
  effects: {
    type: "array",
    items: { type: "object" },
    description:
      "Effects, bottom to top; each { type, visible?, …fields }, missing fields take defaults. " +
      'Types: "drop-shadow" / "inner-shadow" { color, opacity, x, y, blur, spread, showBehind? }, ' +
      '"layer-blur" { radius, progressive?, start?, end?, startRadius? }, "background-blur" ' +
      '{ radius } (shows through translucent fills), "noise" { noiseType: mono|duo|multi, color, ' +
      'secondColor, opacity, size, density }, "texture" { size, radius, clipToShape }, "glass" ' +
      "{ lightAngle, lightIntensity, refraction, depth, dispersion, frost, splay }, " +
      '"shader" { code, params }. Lengths are world units; [] removes them all.',
  },
  opacity: { type: "number", description: "0–1; a frame's or group's covers what it holds." },
  blendMode: {
    type: "string",
    enum: [...LAYER_BLEND_MODES],
    description:
      "How the layer blends with what's under it, as in Figma (default pass-through: a frame's " +
      "or group's layers blend through it; normal for a single layer).",
  },
  visible: { type: "boolean" },
  isMask: {
    type: "boolean",
    description:
      "Makes it a mask: it isn't drawn, and the layers above it in the same parent (up to the " +
      "next mask) show only through it. Prefer mask_nodes, which also groups them.",
  },
  maskType: {
    type: "string",
    enum: ["alpha", "vector", "luminance"],
    description:
      "How a mask masks: by its opacity (alpha, default), its outline alone (vector) or its " +
      "brightness (luminance).",
  },
  maskInverted: {
    type: "boolean",
    description: "A mask that shows what's outside it instead (a cut-out).",
  },
  sizing: {
    type: "object",
    properties: {
      h: { type: "string", enum: ["fixed", "hug", "fill"] },
      v: { type: "string", enum: ["fixed", "hug", "fill"] },
    },
    description:
      "How its width (h) and height (v) are decided, as in Figma: fixed, hug (an auto layout " +
      "frame takes its layers' size; texts hug through autoResize) or fill (the room its auto " +
      "layout parent leaves, shared with the other fill layers; across the direction: stretched).",
  },
  layoutAbsolute: {
    type: "boolean",
    description: "In an auto layout frame: stays where it is (Figma's Ignore auto layout).",
  },
  sizeLimits: {
    type: ["object", "null"],
    properties: {
      minW: { type: "number" },
      maxW: { type: "number" },
      minH: { type: "number" },
      maxH: { type: "number" },
    },
    description: "The smallest and largest an auto layout may make it.",
  },
  rotation: {
    type: "number",
    description:
      "Degrees counterclockwise, round its top-left corner (x, y), as in Figma; a line's ends turn.",
  },
  text: { type: "string", description: "Text: its content." },
  color: { type: "string", description: "Text: its color, or a CSS gradient." },
};
