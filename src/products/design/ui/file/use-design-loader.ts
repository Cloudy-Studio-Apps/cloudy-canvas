import { useCanvasFileLoader, type CanvasFileLoadState } from "@canvas-ui";
import { designMigrations, newDesignDocument, openDesignDocument } from "@design";
import { getDesignModules, getDesignProduct } from "../modules";

/**
 * Loads the design with this id (brought up to date by the modules' migrations), or starts an
 * empty one when the id isn't a saved file (a design just created from Home).
 */
export function useDesignLoader(id: string): CanvasFileLoadState {
  return useCanvasFileLoader(id, {
    noun: "design",
    open: (bytes) =>
      openDesignDocument(bytes, getDesignProduct().kinds, getDesignModules().get(designMigrations)),
    create: () =>
      newDesignDocument(getDesignProduct().kinds, getDesignModules().get(designMigrations)),
  });
}
