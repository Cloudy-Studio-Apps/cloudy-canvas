// The element framework: what every element is (`CanvasElement`), how a type behaves
// (`ElementKind` and the shared bases) and each product's open registry of kinds (`ElementKinds`).
// The element types themselves live in the products (e.g. `products/board/elements`).
export type * from "./element.types";
export type * from "./element.kind.types";
export type * from "./element.info.types";
export type * from "./element.interaction.types";
export type * from "./bases";
export type * from "./reorder.types";
export { ElementKind } from "./element.kind";
export { ElementKinds } from "./element.kinds";
export { ELEMENT_DEFAULTS } from "./element.defaults";
export { BoxKind, LineKind, TextBoxKind } from "./bases";
export { createElementBase } from "./element.factory";
export { elementInfo } from "./element.info";
export { reorderIndexes } from "./reorder";
export { zOrderKey } from "./z-order";
