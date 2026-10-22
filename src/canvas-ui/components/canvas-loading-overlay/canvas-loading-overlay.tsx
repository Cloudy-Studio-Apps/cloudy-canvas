import { LoadingScreen } from "@shared/ui/components/loading-screen";
import type { CanvasLoadingOverlayProps } from "./canvas-loading-overlay.types";

/** Covers an editor while its file is read and its canvas is built (`useCanvasEngine`'s loading). */
export function CanvasLoadingOverlay({ title, loading }: CanvasLoadingOverlayProps) {
  return (
    <LoadingScreen
      title={title}
      stage={loading?.stage ?? "Opening file"}
      progress={loading?.progress}
      className="absolute inset-0 z-50 bg-background"
    />
  );
}
