// The design editor (React): the page at `/design/:id`, its chrome and panels (assembled from the
// modules' points), file loading and saving, and the open design for agents.
export type * from "./modules";
export { getActiveDesign, waitForActiveDesign } from "./agent";
export { DesignEditorPage } from "./design-editor-page";
export { importFigmaFile, importFigmaWithLoading } from "./file";
export {
  designEditor,
  getDesignEditorModules,
  getDesignModules,
  getDesignProduct,
  registerDesignModule,
} from "./modules";
