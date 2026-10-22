// Figma import: reads `.fig` files ("Save local copy…") into designs. Reading the file (Kiwi,
// the container, the node tree) is shared with FigJam's import in `@canvas/figma`; this folder
// converts the nodes to design elements (`convert/`). It isn't in the `@design` barrel: the app
// loads it with a dynamic `import()` only when a Figma file is opened, so it costs nothing
// otherwise. The reading and converting run in a worker (`figma-import.worker.ts`,
// `convertFigmaFile`).
export type * from "./figma-import.types";
export { convertFigma } from "./convert/convert-figma";
export { convertFigmaFile } from "./convert-figma-file";
export { figmaDesignDocument } from "./figma-design-document";
