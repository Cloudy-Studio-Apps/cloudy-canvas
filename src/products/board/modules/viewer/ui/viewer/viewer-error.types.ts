/** Why the viewer can't show the board: no WebGL, or the file's data is damaged. */
export type ViewerErrorReason = "webgl" | "data";

export interface ViewerErrorProps {
  reason: ViewerErrorReason;
}
