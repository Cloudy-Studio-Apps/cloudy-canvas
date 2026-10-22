/**
 * The id a guide goes by in a snapper's excluded ids (`ToolContext.createSnapper`), so a guide
 * being dragged doesn't snap to itself.
 */
export function rulerGuideKey(index: number): string {
  return `ruler-guide:${index}`;
}
