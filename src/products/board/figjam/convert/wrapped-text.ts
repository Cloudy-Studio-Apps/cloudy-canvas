import type { FigNode } from "@canvas/figma";

/**
 * A text node's characters with a line break wherever FigJam wrapped them (its laid-out lines),
 * so the text keeps its lines on the board, whose free texts don't wrap.
 */
export function wrappedText(node: FigNode): string {
  const characters = node.textData?.characters ?? "";
  const starts = (node.derivedTextData?.baselines ?? [])
    .map((line) => line.firstCharacter)
    .filter((start): start is number => start !== undefined);
  if (starts.length < 2) return characters;
  return starts
    .map((start, i) => {
      const line = characters.slice(i === 0 ? 0 : start, starts[i + 1] ?? characters.length);
      return line.endsWith("\n") ? line.slice(0, -1) : line.trimEnd();
    })
    .join("\n");
}
