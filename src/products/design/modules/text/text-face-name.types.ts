import type { FontWeight } from "@shared/core";

/** A face read from its name: a weight when the name says one, and a style. */
export interface FaceFromName {
  fontWeight?: FontWeight;
  fontStyle: "normal" | "italic";
}
