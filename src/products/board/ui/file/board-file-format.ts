import { encodeBoardFile } from "@board";
import type { CanvasFileFormat } from "@canvas-ui";
import { t } from "../board-ui.i18n";

/** How boards are saved: `.cboard` files. */
export const BOARD_FILE_FORMAT: CanvasFileFormat = {
  type: "board",
  noun: t("file.noun"),
  untitled: t("file.untitled"),
  encode: (doc) => encodeBoardFile(doc.encode()),
};
