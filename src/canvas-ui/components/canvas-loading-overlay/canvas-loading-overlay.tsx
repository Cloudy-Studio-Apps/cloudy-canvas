import { LoadingScreen } from "@shared/ui/components/loading-screen";
import type { CanvasLoadingOverlayProps } from "./canvas-loading-overlay.types";
import { t } from "../components.i18n";

/** Covers an editor while its file is read and its canvas is built (`useCanvasEngine`'s loading). */
export function CanvasLoadingOverlay({ title, loading }: CanvasLoadingOverlayProps) {
  return (
    <LoadingScreen
      title={title}
      stage={loading?.stage ?? t("loading.opening")}
      progress={loading?.progress}
      className="absolute inset-0 z-50 bg-background"
    />
  );
}
