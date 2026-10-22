// The design editor (React): the page at `/design/:id`, its chrome and panels (assembled from the
// modules' points), file loading and saving.
export type * from "./modules";
export { DesignEditorPage } from "./design-editor-page";
export {
  designEditor,
  getDesignEditorModules,
  getDesignModules,
  getDesignProduct,
  registerDesignModule,
} from "./modules";
