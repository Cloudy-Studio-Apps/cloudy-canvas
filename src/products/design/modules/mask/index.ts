// Masks, as in Figma: a layer with `isMask` isn't drawn, and the siblings above it show only
// through it (alpha, vector or luminance; inverted as a cut-out). The canvas draws and hits them
// through `designMasks`; "Use as mask" (Ctrl+Alt+M) makes mask groups.
export type * from "./mask-edits.types";
export { designMasks } from "./design-masks";
export { maskedByMask, maskNodes, masksAmong, maskOverNode, releaseMasks } from "./mask-edits";
export { maskTools } from "./mask.agent-tools";
