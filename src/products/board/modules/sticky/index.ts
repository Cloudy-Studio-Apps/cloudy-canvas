// Sticky notes. The module (`sticky.module.ts`) registers the kind, the tool and its panel.
export type * from "./sticky.types";
export type * from "./sticky-options.types";
export { createSticky } from "./sticky.factory";
export { StickyKind } from "./sticky.kind";
export { STICKY_DEFAULTS } from "./sticky.defaults";
export { StickyTool } from "./sticky.tool";
