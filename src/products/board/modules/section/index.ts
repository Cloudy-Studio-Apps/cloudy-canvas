// Sections: frames that take the elements inside them along. The module (`section.module.ts`)
// registers the kind, the tool (Shift+S), its panel and the top bar's Sections menu.
export type * from "./section.types";
export type * from "./section-options.types";
export { createSection } from "./section.factory";
export { SectionKind } from "./section.kind";
export { SECTION_DEFAULTS } from "./section.defaults";
export { isSection } from "./is-section";
export { boardSections, sectionMembers, withSectionMembers } from "./section-members";
export { SectionTool } from "./section.tool";
