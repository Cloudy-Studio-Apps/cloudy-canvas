import { CanvasDocument, type ShareGuest } from "@canvas";
import { useCanvasFileLoader, type CanvasFileLoadState } from "@canvas-ui";
import { designMigrations, newDesignDocument, openDesignDocument } from "@design";
import { getDesignModules, getDesignProduct } from "../modules";

/**
 * Loads the design with this id (brought up to date by the modules' migrations), or starts an
 * empty one when the id isn't a saved file (a design just created from Home). With `live`, the
 * design is a live session's (the host's, already up to date).
 */
export function useDesignLoader(id: string, live: ShareGuest | null = null): CanvasFileLoadState {
  return useCanvasFileLoader(id, {
    noun: "design",
    open: (bytes) =>
      openDesignDocument(bytes, getDesignProduct().kinds, getDesignModules().get(designMigrations)),
    create: () =>
      newDesignDocument(getDesignProduct().kinds, getDesignModules().get(designMigrations)),
    ...(live ? { live: () => new CanvasDocument(getDesignProduct().kinds, live.doc) } : {}),
  });
}
