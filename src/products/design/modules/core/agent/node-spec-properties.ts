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
    'radial-gradient, conic-gradient); or { type: "image", assetId, scaleMode?: "fill" | "fit", ' +
    "opacity?, visible? } (fills only).",
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
  opacity: { type: "number", description: "0–1." },
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
  rotation: {
    type: "number",
    description:
      "Degrees counterclockwise, round its top-left corner (x, y), as in Figma; a line's ends turn.",
  },
  text: { type: "string", description: "Text: its content." },
  color: { type: "string", description: "Text: its color, or a CSS gradient." },
};
