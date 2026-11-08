import type { ElementDefaults } from "@canvas";

/** A model has no style of its own; its view (angle, zoom) is set in the panel or by agents. */
export const MODEL_NODE_DEFAULTS = {} as const satisfies ElementDefaults;

/** The stored fields only the import and the model tools write (agents can't patch them). */
export const MODEL_STORED_FIELDS = [
  "modelAssetId",
  "mtlAssetId",
  "format",
  "fileName",
  "fileSize",
  "pictureAssetId",
  "textures",
] as const;
