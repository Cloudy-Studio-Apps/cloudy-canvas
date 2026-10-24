import { useFrameImage } from "../hooks/use-frame-image";
import type { PreviewPageProps } from "./preview.types";

/** One page of the preview at its size on screen (a white sheet until it's drawn). */
export function PreviewPage({ frame, width }: PreviewPageProps) {
  const height = (width * frame.h) / frame.w;
  // Drawn at the screen's resolution.
  const url = useFrameImage(frame, Math.round(Math.max(width, height) * window.devicePixelRatio));
  return (
    <span className="block bg-surface" style={{ width, height }}>
      {url && <img src={url} alt={frame.name} className="size-full" draggable={false} />}
    </span>
  );
}
