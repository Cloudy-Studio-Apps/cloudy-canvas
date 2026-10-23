import { useRef } from "react";

import type { Point } from "@canvas";
import {
  normalizedToScreen,
  screenToNormalized,
  useViewMapping,
  type OverlayFrame,
} from "@canvas-ui";
import type {
  DropShadowEffect,
  GlassEffect,
  InnerShadowEffect,
  LayerBlurEffect,
  NodeEffect,
} from "@design";
import { useEditNodes, useSelectedNodes } from "@design/ui/hooks";
import { useEffectEditStore } from "../effect-edit-store";
import { BlurHandles } from "./blur-handles";
import { GlassHandles } from "./glass-handles";
import type { StartHandleDrag } from "./handles.types";
import { ShadowHandles } from "./shadow-handles";

/**
 * The handles of the effect whose editor is open, over its layer: a shadow's offset (and blur),
 * a progressive blur's start and end, glass's light. Shown while one layer is selected; a drag
 * is one undo step.
 */
export function EffectHandles() {
  const editing = useEffectEditStore((state) => state.editing);
  const nodes = useSelectedNodes();
  const edit = useEditNodes();
  const view = useViewMapping();
  const svg = useRef<SVGSVGElement>(null);
  const node = nodes.length === 1 ? nodes[0] : undefined;
  const effect = node?.effects.find((e) => e.id === editing);
  if (!node || !effect || !effect.visible) return null;

  const frame: OverlayFrame = {
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
    rotation: node.rotation ?? 0,
  };
  const screen = (p: Point) => normalizedToScreen(p, frame, view);
  const change = (next: NodeEffect, first: boolean) =>
    edit(
      [node],
      (current) => ({ effects: current.effects.map((e) => (e.id === next.id ? next : e)) }),
      { checkpoint: first },
    );
  const startDrag: StartHandleDrag = (event, onMove) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const box = svg.current?.getBoundingClientRect();
      if (!box) return;
      onMove(
        screenToNormalized({ x: e.clientX - box.left, y: e.clientY - box.top }, frame, view),
        e,
      );
    };
    const end = () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
  };
  const props = { frame, view, screen, startDrag };

  return (
    <svg
      ref={svg}
      data-effect-handles
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {(effect.type === "drop-shadow" || effect.type === "inner-shadow") && (
        <ShadowHandles
          {...props}
          effect={effect as DropShadowEffect | InnerShadowEffect}
          change={change}
        />
      )}
      {effect.type === "layer-blur" && (
        <BlurHandles {...props} effect={effect as LayerBlurEffect} change={change} />
      )}
      {effect.type === "glass" && (
        <GlassHandles {...props} effect={effect as GlassEffect} change={change} />
      )}
    </svg>
  );
}
