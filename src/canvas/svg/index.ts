// Reading SVG files as outlines (`readSvg`): path data, the basic shapes, transforms, paints and
// a die-cut edge filter. The design turns stickers into vector layers with it.
export type * from "./svg.types";
export { readSvg } from "./read-svg";
export { parseSvgPath } from "./svg-path-data";
export { isSvg } from "../render/svg-image";
