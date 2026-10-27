import type { CanvasFileFormat } from "@canvas-ui";
import { encodeDesignFile } from "@design";
import { t } from "../design-ui.i18n";

/** How designs are saved: `.cdesign` files. */
export const DESIGN_FILE_FORMAT: CanvasFileFormat = {
  type: "design",
  noun: t("file.noun"),
  untitled: t("file.untitled"),
  encode: (doc) => encodeDesignFile(doc.encode()),
};
