import type { TabLoader } from "@canvas";
import { loadCanvasFile } from "@canvas-ui";
import { designMigrations, newDesignDocument, openDesignDocument } from "@design";
import { getDesignModules, getDesignProduct } from "../modules";
import { t } from "../design-ui.i18n";

/**
 * Loads a design tab's document: the stored design (brought up to date by the modules'
 * migrations), an empty one when the id isn't a saved file (a design just created from Home), or
 * a live session's (the host's, already up to date).
 */
export const designTabLoader: TabLoader = {
  load: (id, live) => {
    const kinds = getDesignProduct().kinds;
    const migrations = getDesignModules().get(designMigrations);
    return loadCanvasFile(
      id,
      {
        noun: t("file.noun"),
        open: (bytes) => openDesignDocument(bytes, kinds, migrations),
        create: () => newDesignDocument(kinds, migrations),
        kinds,
      },
      live,
    );
  },
};
