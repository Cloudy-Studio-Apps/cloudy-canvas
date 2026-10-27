// The design editor (React): the page at `/design/:id`, its chrome and panels (assembled from the
// modules' points), file loading and saving, and the open design for agents. It's also the
// editor's public API: what modules import by path (`@design/ui/components/panel`, …) and plugins
// get as `api.design`, with the engine barrel (`@design`).
export type * from "./stores/image-crop-store.types";
export * from "./components/panel";
export * from "./hooks";
export * from "./modules";
export { getActiveDesign, waitForActiveDesign } from "./agent";
export { DesignEditor } from "./design-editor";
export { DesignEditorPage } from "./design-editor-page";
export { useDesignEngine, useDesignState } from "./design-engine-context";
export { importFigmaFile, importFigmaWithLoading } from "./file";
export { useImageCropStore } from "./stores/image-crop-store";
