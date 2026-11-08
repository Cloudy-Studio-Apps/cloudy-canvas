import { useEffect, useRef } from "react";

import { rectContainsPoint, type Point, type Rect } from "@canvas";
import type { OverlayEntry } from "../../model";
import type { PlayerTarget } from "./player-surfaces.types";
import { activeSurface, firstWith, onOverlay, targetsAt } from "./trigger-hits";
import type { PointerTrack, TriggerHold, TriggerOptions } from "./use-triggers.types";

/** How far (CSS px) a press moves before it's a drag. */
const DRAG_PX = 12;

/**
 * The pointer's triggers on what takes input (the top overlay, else the screen) and its delays.
 * A click runs the nearest target under it with a click interaction (or calls `onMiss`); outside
 * an overlay that closes on a click outside, it closes it. Hover runs on entering and closes the
 * overlay it opened once the pointer is off the target and that overlay; press runs on the press
 * and closes its overlay on release; enter and leave run on crossing; drag after 12 px. Delays
 * start when a screen or overlay shows and are cleared when it goes or the player closes. The
 * pointer is hit-tested in device units, so layers never need events of their own.
 */
export function useTriggers({ run, box, surfaces, scale, onMiss }: TriggerOptions): void {
  const latest = useRef({ surfaces, scale, onMiss });
  useEffect(() => {
    latest.current = { surfaces, scale, onMiss };
  });

  const shownKey = activeSurface(surfaces)?.key ?? null;
  useEffect(() => {
    const surface = activeSurface(latest.current.surfaces);
    if (!surface || shownKey === null) return;
    const timers = surface.targets.flatMap(({ interactions }) =>
      interactions
        .filter((ix) => ix.trigger === "delay")
        .map((ix) => window.setTimeout(() => void run.run(ix), ix.delay ?? 0)),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [run, shownKey]);

  useEffect(() => {
    if (!box) return;
    const track: PointerTrack = {
      surface: null,
      inside: new Set(),
      holds: [],
      pressing: false,
      drag: null,
      dragged: false,
    };
    const at = (event: MouseEvent): Point => {
      const bounds = box.getBoundingClientRect();
      const s = latest.current.scale || 1;
      return { x: (event.clientX - bounds.left) / s, y: (event.clientY - bounds.top) / s };
    };
    const shown = () => activeSurface(latest.current.surfaces);
    const holdOn = (kind: TriggerHold["kind"], rect: Rect) => (entry: OverlayEntry | null) => {
      if (!entry) return;
      if (kind === "press" && !track.pressing) run.closeIfTop(entry);
      else track.holds.push({ kind, entry, rect });
    };
    const entered = (target: PlayerTarget) => {
      const ix = target.interactions.find((i) => i.trigger === "hover" || i.trigger === "enter");
      if (!ix) return;
      const opened = run.run(ix);
      if (ix.trigger === "hover") void opened.then(holdOn("hover", target.rect));
    };
    const left = (target: PlayerTarget) => {
      const ix = target.interactions.find((i) => i.trigger === "leave");
      if (ix) void run.run(ix);
    };
    const crossings = (p: Point) => {
      const surface = shown();
      if ((surface?.key ?? null) !== track.surface) {
        track.surface = surface?.key ?? null;
        track.inside = new Set();
      }
      if (!surface) return;
      const now = new Set(targetsAt(surface, p).map((target) => target.id));
      for (const target of surface.targets) {
        const was = track.inside.has(target.id);
        if (now.has(target.id) && !was) entered(target);
        else if (was && !now.has(target.id)) left(target);
      }
      track.inside = now;
    };

    const onClick = (event: MouseEvent) => {
      const surface = shown();
      if (track.dragged || run.isBusy() || !surface) return;
      const p = at(event);
      if (!rectContainsPoint(surface.rect, p)) {
        if (surface.overlay?.interaction.overlay?.closeOutside) run.closeTop();
        return;
      }
      const hit = firstWith(targetsAt(surface, p), "click");
      if (hit) void run.run(hit.ix);
      else latest.current.onMiss();
    };
    const onDown = (event: PointerEvent) => {
      track.dragged = false;
      track.pressing = true;
      const surface = shown();
      if (event.button !== 0 || run.isBusy() || !surface) return;
      const hits = targetsAt(surface, at(event));
      const drag = firstWith(hits, "drag");
      track.drag = drag ? { x: event.clientX, y: event.clientY, ix: drag.ix } : null;
      const press = firstWith(hits, "press");
      if (press) void run.run(press.ix).then(holdOn("press", press.target.rect));
    };
    const onMove = (event: PointerEvent) => {
      const drag = track.drag;
      if (drag && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) >= DRAG_PX) {
        track.drag = null;
        track.dragged = true;
        void run.run(drag.ix);
      }
      const p = at(event);
      track.holds = track.holds.filter((hold) => {
        if (hold.kind !== "hover" || rectContainsPoint(hold.rect, p)) return true;
        if (onOverlay(latest.current.surfaces, hold.entry, p)) return true;
        run.closeIfTop(hold.entry);
        return false;
      });
      if (!run.isBusy()) crossings(p);
    };
    const onUp = () => {
      track.pressing = false;
      track.drag = null;
      track.holds = track.holds.filter((hold) => {
        if (hold.kind !== "press") return true;
        run.closeIfTop(hold.entry);
        return false;
      });
    };

    box.addEventListener("click", onClick);
    box.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      box.removeEventListener("click", onClick);
      box.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [box, run]);
}
