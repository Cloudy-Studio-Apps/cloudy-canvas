import { useFrameImage } from "../hooks/use-frame-image";
import type { PreviewPageProps } from "./preview.types";
import { pictureSide } from "./preview-size";

/** One page of the preview at its size on screen (a blank sheet until it's drawn). */
export function PreviewPage({
  frame,
  width,
  height = (width * frame.h) / frame.w,
}: PreviewPageProps) {
  const url = useFrameImage(frame, pictureSide({ width, height }));
  return (
    <span className="block bg-surface" style={{ width, height }}>
      {url && (
        <img src={url} alt={frame.name} className="size-full object-contain" draggable={false} />
      )}
    </span>
  );
}
