/** The input schema of the tools that place a model file (`model3d_add`). */
export const ADD_MODEL_PROPERTIES = {
  path: { type: "string", description: "Absolute path of the model file." },
  x: { type: "number", description: "Left edge. Default 0." },
  y: { type: "number", description: "Top edge. Default 0." },
  h: { type: "number", description: "Height; the width follows." },
  textures: {
    type: "object",
    description: "Slot name to the absolute path of a picture for that slot.",
    additionalProperties: { type: "string" },
  },
} as const;

/** The input schema of the tools that change a model's view (`model3d_view_set`, …). */
export const SET_MODEL_VIEW_PROPERTIES = {
  id: { type: "string" },
  angle: {
    type: "object",
    properties: { x: { type: "number" }, y: { type: "number" }, z: { type: "number" } },
  },
  zoom: { type: "number" },
  textures: { type: "object", additionalProperties: { type: ["string", "null"] } },
} as const;
