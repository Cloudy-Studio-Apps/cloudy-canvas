import type { SidePictureProps } from "./preview.types";
import { PreviewPage } from "./preview-page";

/** A side of the booklet: its page (or half a spread frame), or plain paper for a blank page. */
export function SidePicture({ side, width, height }: SidePictureProps) {
  if (!side) return null;
  if (side.kind === "blank") return <span className="block bg-surface" style={{ width, height }} />;
  return <PreviewPage frame={side.page.frame} part={side.part} width={width} height={height} />;
}
