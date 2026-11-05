import type { FrameElement } from "./frame.types";

/**
 * The words drawn after a top-level frame's name, or `null` for none. A module whose answer
 * changes redraws the frames it changed for with `engine.refreshElements`.
 */
export type FrameLabelTag = (frame: FrameElement) => string | null;
