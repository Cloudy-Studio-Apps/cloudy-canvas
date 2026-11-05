import type { FrameLabelTag } from "../../../frame";

/** The words after each page frame's name for the open design, by frame id. */
let shown: ReadonlyMap<string, string> = new Map();

/**
 * The catalog's `frameLabelTags` entry: the words the open design's brochures put after a page
 * frame's name (`brochureFrameTags`, kept by `useFrameLabelTags`); a map read on each redraw.
 */
export const shownFrameTag: FrameLabelTag = (frame) => shown.get(frame.id) ?? null;

/** Shows `next` from now on; returns the frames whose words changed, to draw again. */
export function showFrameTags(next: ReadonlyMap<string, string>): string[] {
  const changed = [...next].filter(([id, tag]) => shown.get(id) !== tag).map(([id]) => id);
  for (const id of shown.keys()) if (!next.has(id)) changed.push(id);
  shown = next;
  return changed;
}
