import type { CanvasFileFormat } from "@canvas-ui";
import { encodeDesignFile } from "@design";

/** How designs are saved: `.cdesign` files. */
export const DESIGN_FILE_FORMAT: CanvasFileFormat = {
  type: "design",
  noun: "design",
  untitled: "Untitled design",
  encode: (doc) => encodeDesignFile(doc.encode()),
};
