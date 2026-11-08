import { useCallback, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";

import { modelSource } from "@canvas";
import type { ModelRotation } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";

import { useViewMapping } from "../../overlay";
import { t } from "../model3d.i18n";
import { liveKey } from "./live-key";
import { texturesKeyOf } from "./live-model";
import { useModelEditStore } from "./model-edit-store";
import type { ModelLiveBodyProps } from "./model-live-view.types";
import { useFinishOnEscape } from "./use-finish-on-escape";
import { useLiveRenderer } from "./use-live-renderer";
import { useOrbitDrag } from "./use-orbit-drag";
import { useWheelZoom } from "./use-wheel-zoom";

/**
 * The live 3D view of the model `id`, over its element (like the image crop): three.js's own
 * canvas with a transparent background. Dragging turns the model, the wheel zooms it and Esc
 * finishes. A spinner shows while the model is prepared.
 */
export function ModelLiveBody({
  engine,
  id,
  draft,
  frame,
  data,
  source,
  onFinish,
}: ModelLiveBodyProps) {
  const view = useViewMapping();
  const box = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const status = useModelEditStore((state) => state.status);
  const change = useModelEditStore((state) => state.change);
  const ready = useModelEditStore((state) => state.ready);
  const stop = useModelEditStore((state) => state.stop);

  const { textures } = draft;
  const texturesKey = texturesKeyOf(textures);
  const key = liveKey(engine, id);
  const read = useCallback(() => {
    const current = { ...data, textures };
    return source ? source(current) : modelSource(engine.doc, current);
  }, [data, textures, source, engine]);

  const finish = useCallback(() => {
    const state = useModelEditStore.getState();
    if (state.engine !== engine || !state.id || !state.draft) return;
    const result = { id: state.id, draft: state.draft };
    void stop();
    onFinish?.(result);
  }, [engine, stop, onFinish]);

  const failed = useCallback(
    (error: unknown) => {
      notifyError(t("edit.loadFailed"), error);
      void stop();
    },
    [stop],
  );

  const angle = useCallback(
    () => useModelEditStore.getState().draft?.angle ?? draft.angle,
    [draft.angle],
  );
  const turn = useCallback((next: ModelRotation) => change({ angle: next }), [change]);
  const zoomBy = useCallback(
    (factor: number) => {
      const current = useModelEditStore.getState().draft;
      if (current) change({ zoom: current.zoom * factor });
    },
    [change],
  );
  const onReady = useCallback(() => ready(id), [id, ready]);

  const size = useMemo(
    () => ({ w: frame.w * view.zoom, h: frame.h * view.zoom }),
    [frame.w, frame.h, view.zoom],
  );
  useLiveRenderer({
    key,
    texturesKey,
    read,
    host,
    view: draft,
    size,
    onReady,
    onError: failed,
  });
  useWheelZoom(box, zoomBy);
  useFinishOnEscape(finish);
  const drag = useOrbitDrag({ angle, onTurn: turn });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={box}
        role="img"
        aria-label={t("edit.view")}
        className="pointer-events-auto absolute cursor-grab touch-none active:cursor-grabbing"
        style={{
          left: view.origin.x + frame.x * view.zoom,
          top: view.origin.y + frame.y * view.zoom,
          width: size.w,
          height: size.h,
          transform: frame.rotation ? `rotate(${-frame.rotation}deg)` : undefined,
          transformOrigin: "0 0",
        }}
        onPointerDown={drag}
      >
        <div
          ref={host}
          className="size-full"
          style={frame.mirrored ? { transform: "scaleX(-1)" } : undefined}
        />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center">
            <Loader2
              className="size-6 animate-spin text-muted-foreground"
              aria-label={t("edit.loading")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
