import type { NewVariable } from "@canvas";

/** What "+" adds: a color named "Color" (numbered when taken), the app's blue. */
export const NEW_COLOR = {
  name: "Color",
  type: "color",
  value: { color: "#3A83C9FF" },
} as const satisfies Omit<NewVariable, "collectionId">;
