const PAINTS = {
  type: "array",
  description:
    'Paints bottom to top: { type: "solid", color: "#RRGGBB", opacity?: 0–1, visible? } or ' +
    '{ type: "image", assetId, scaleMode?: "fill" | "fit", opacity?, visible? }.',
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
  fill: { type: "string", description: 'One solid fill color, or "transparent" for none.' },
  fills: PAINTS,
  stroke: { type: "string", description: 'One solid stroke color, or "transparent" for none.' },
  strokes: PAINTS,
  strokeWeight: { type: "number" },
  opacity: { type: "number", description: "0–1." },
  visible: { type: "boolean" },
  text: { type: "string", description: "Text: its content." },
  color: { type: "string", description: "Text: its color." },
};
