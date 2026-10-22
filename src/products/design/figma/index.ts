// Figma import: reads `.fig` files ("Save local copy…") into designs. Everything Figma-specific
// lives in this folder: the Kiwi decoder (`kiwi/`), the file container (`container/`) and the
// conversion to design elements (`convert/`). It isn't in the `@design` barrel: the app loads it
// with a dynamic `import()` only when a Figma file is opened, so it costs nothing otherwise.
export type * from "./figma-import.types";
export { isFigmaFile, readFigFile } from "./container";
export { convertFigma } from "./convert/convert-figma";
export { figmaDesignDocument } from "./figma-design-document";
