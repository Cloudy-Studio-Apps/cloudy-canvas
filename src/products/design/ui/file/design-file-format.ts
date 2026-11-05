import type { CanvasFileFormat } from "@canvas-ui";
import { encodeDesignFile, pruneSnapshots } from "@design";
import { t } from "../design-ui.i18n";

/**
 * How designs are saved: `.cdesign` files. Data snapshots no source points at any more are
 * dropped first (`pruneSnapshots`), so old copies of a source's rows don't pile up in the file.
 */
export const DESIGN_FILE_FORMAT: CanvasFileFormat = {
  type: "design",
  noun: t("file.noun"),
  untitled: t("file.untitled"),
  encode: (doc) => {
    pruneSnapshots(doc);
    return encodeDesignFile(doc.encode());
  },
};
