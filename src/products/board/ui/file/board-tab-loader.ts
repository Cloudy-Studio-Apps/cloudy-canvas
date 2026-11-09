import { boardMigrations, openBoardDocument } from "@board";
import { CanvasDocument, type TabLoader } from "@canvas";
import { loadCanvasFile } from "@canvas-ui";
import { getBoardModules, getBoardProduct } from "../modules";
import { t } from "../board-ui.i18n";

/**
 * Loads a board tab's document: the stored board (brought up to date by the modules'
 * migrations), an empty one when the id isn't a saved file (a board just created from Home), or a
 * live session's (the host's, already up to date).
 */
export const boardTabLoader: TabLoader = {
  load: (id, live) => {
    const kinds = getBoardProduct().kinds;
    return loadCanvasFile(
      id,
      {
        noun: t("file.noun"),
        open: (bytes) => openBoardDocument(bytes, kinds, getBoardModules().get(boardMigrations)),
        create: () => new CanvasDocument(kinds),
        kinds,
      },
      live,
    );
  },
};
