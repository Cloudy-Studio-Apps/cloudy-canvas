// FigJam import: reads `.jam` files ("Save local copy…") into boards. Reading the file (Kiwi, the
// container, the node tree) is shared with the design's Figma import in `@canvas/figma`; this
// folder converts FigJam's nodes to board elements (`convert/`). It isn't in the `@board` barrel:
// the app loads it with a dynamic `import()` only when a FigJam file is opened, so it costs
// nothing otherwise. The reading and converting run in a worker (`figjam-import.worker.ts`,
// `convertFigJamFile`).
export type * from "./figjam-import.types";
export { convertFigJam } from "./convert/convert-figjam";
export { convertFigJamFile } from "./convert-figjam-file";
export { figjamBoardDocument } from "./figjam-board-document";
