import type { FigNode, FigOverride } from "@canvas/figma";

/** The generated part of a sticky, shape or connector that's its body (fill, stroke). */
export const BODY_PART = 0;
/** The generated part that's its text (characters, size, color). */
export const TEXT_PART = 1;

/**
 * A part FigJam generates for a sticky, shape or connector, with its looks: stickies and shapes
 * keep their colors and text there, not on the node.
 */
export function generatedPart(node: FigNode, part: number): FigOverride | undefined {
  return node.nodeGenerationData?.overrides?.find((override) => {
    const guids = override.guidPath?.guids;
    return guids?.length === 1 && guids[0]?.localID === part;
  });
}

/** The text of a node's generated text part, `""` when it has none. */
export function generatedText(node: FigNode): string {
  return generatedPart(node, TEXT_PART)?.textData?.characters ?? "";
}
