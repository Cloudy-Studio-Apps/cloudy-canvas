import { useEffect, useRef, useState } from "react";

import { acquireLiveScene, attachLiveScene, drawLiveScene, releaseLiveScene } from "./live-model";
import type { LiveScene } from "./live-model.types";
import type { LiveRendererOptions } from "./use-live-renderer.types";

/**
 * Shows the live model in `host`: takes the kept scene when it's the same model (instant) or
 * loads it, draws it whenever the view or the size changes (never in a loop) and, when the view
 * closes, leaves it to be freed `LIVE_RELEASE_DELAY_MS` later.
 */
export function useLiveRenderer({
  key,
  texturesKey,
  read,
  host,
  view,
  size,
  onReady,
  onError,
}: LiveRendererOptions): void {
  const [scene, setScene] = useState<LiveScene | null>(null);
  const latest = useRef({ read, onReady, onError });
  useEffect(() => {
    latest.current = { read, onReady, onError };
  });

  useEffect(() => {
    let active = true;
    acquireLiveScene(key, texturesKey, () => latest.current.read()).then(
      (next) => {
        if (!next) return;
        // Closed while it loaded: it is freed after the delay like any closed view.
        if (!active) return releaseLiveScene(key);
        setScene(next);
        latest.current.onReady();
      },
      (error: unknown) => {
        if (active) latest.current.onError(error);
      },
    );
    return () => {
      active = false;
    };
  }, [key, texturesKey]);

  useEffect(() => {
    const target = host.current;
    if (!scene || !target) return;
    attachLiveScene(scene, target);
  }, [scene, host]);

  useEffect(() => () => releaseLiveScene(key), [key]);

  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const { angle, zoom } = view;
  useEffect(() => {
    if (!scene) return;
    drawLiveScene(
      scene,
      { angle, zoom },
      { w: Math.max(1, size.w * dpr), h: Math.max(1, size.h * dpr) },
    );
  }, [scene, angle, zoom, size.w, size.h, dpr]);
}
