import { useFrameImage } from "../hooks/use-frame-image";
import type { PreviewPageProps } from "./preview.types";
import { pictureSide } from "./preview-size";

/**
 * A page of the preview at its size on screen: all of a frame, or one half of a spread frame (the
 * whole picture, clipped). A blank sheet until it's drawn.
 */
export function PreviewPage({ frame, part, width, height }: PreviewPageProps) {
  const half = part !== "whole";
  // The whole frame's picture, so both halves of a spread share it.
  const scale = (half ? width * 2 : width) / frame.w;
  const url = useFrameImage(frame, pictureSide(frame, scale));
  return (
    <span className="relative block overflow-hidden bg-surface" style={{ width, height }}>
      {url && (
        <img
          src={url}
          alt={frame.name}
          draggable={false}
          className="absolute top-0 h-full max-w-none"
          style={{ width: half ? width * 2 : width, left: part === "right" ? -width : 0 }}
        />
      )}
    </span>
  );
}
