// Sections: labeled areas that hold frames (drawn by the core's `BoxDrawTool`, Shift+S). The module
// (`section.module.ts`) puts the tool in the frame menu.
export type * from "./section.types";
export { createSection } from "./section.factory";
export { SECTION_DEFAULTS } from "./section.defaults";
export { SectionKind } from "./section.kind";
