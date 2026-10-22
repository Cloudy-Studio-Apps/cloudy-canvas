import { useMemo } from "react";

import {
  addStop,
  gradientCss,
  sortStops,
  withEase,
  withInterpolation,
  type Gradient,
} from "@canvas";
import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { useDesignEngine } from "../../design-engine-context";
import { useGradientEditStore } from "../../stores/gradient-edit-store";
import { usePaintRecentsStore } from "../../stores/paint-recents-store";
import { ColorControls } from "./color-controls";
import { GradientStopBar } from "./gradient-stop-bar";
import { GradientStopRow } from "./gradient-stop-row";
import { GradientSwatches } from "./gradient-swatches";
import { GradientToolbar } from "./gradient-toolbar";
import { pageGradients } from "./page-gradients";
import type { GradientEditorProps } from "./paint-picker.types";
import { StopEaseSelect } from "./stop-ease-select";

/**
 * A gradient paint: its stops on a strip, the selected stop's color and blend, the stop list,
 * actions (reverse, turn, smooth blending, copy as CSS), then the page's and the recent gradients.
 */
export function GradientEditor({ paint, onChange, size }: GradientEditorProps) {
  const engine = useDesignEngine();
  const selected = useGradientEditStore((state) => Math.min(state.stop, paint.stops.length - 1));
  const select = useGradientEditStore((state) => state.setStop);
  const recents = usePaintRecentsStore((state) => state.gradients);
  const addRecent = usePaintRecentsStore((state) => state.addGradient);
  const onPage = useMemo(() => pageGradients(engine.elements()), [engine]);
  const stop = paint.stops[selected]!;
  // The list reads top to bottom by position, like the strip left to right.
  const order = useMemo(
    () => sortStops(paint.stops.map((s, i) => ({ ...s, index: i }))).map((s) => s.index),
    [paint.stops],
  );

  const change: typeof onChange = (next, info) => {
    onChange(next, info);
    if (info.done) addRecent(next);
  };

  const addAtWidestGap = () => {
    const sorted = sortStops(paint.stops);
    let at = 0.5;
    let widest = -1;
    sorted.forEach((s, i) => {
      const next = sorted[i + 1];
      if (next && next.position - s.position > widest) {
        widest = next.position - s.position;
        at = (s.position + next.position) / 2;
      }
    });
    const { stops, index } = addStop(paint.stops, at, paint.interpolation);
    change({ ...paint, stops }, { done: true });
    select(index);
  };

  const copy = async () => {
    try {
      await clipboard.writeText(gradientCss(paint, size, paint.opacity));
      toast({ title: "Copied the gradient as CSS" });
    } catch (error) {
      notifyError("The gradient couldn't be copied", error);
    }
  };

  const pick = (gradient: Gradient) => {
    change(withInterpolation({ ...paint, ...gradient }, gradient.interpolation), { done: true });
    select(0);
  };

  return (
    <div className="space-y-3">
      <GradientStopBar paint={paint} selected={selected} onSelect={select} onChange={change} />
      <ColorControls
        key={selected}
        label="Stop "
        color={stop.color}
        opacity={stop.opacity}
        onChange={(next, info) =>
          change(
            {
              ...paint,
              stops: paint.stops.map((s, i) => (i === selected ? { ...s, ...next } : s)),
            },
            info,
          )
        }
      />
      <StopEaseSelect
        value={stop.ease ?? "linear"}
        onChange={(ease) =>
          change(
            {
              ...paint,
              stops: paint.stops.map((s, i) => (i === selected ? withEase(s, ease) : s)),
            },
            { done: true },
          )
        }
      />
      <GradientToolbar
        paint={paint}
        onChange={change}
        onAddStop={addAtWidestGap}
        onCopy={() => void copy()}
      />
      <div className="flex flex-col gap-1">
        {order.map((index) => (
          <GradientStopRow
            key={index}
            paint={paint}
            index={index}
            selected={index === selected}
            onSelect={() => select(index)}
            onChange={change}
          />
        ))}
      </div>
      <GradientSwatches title="On this page" gradients={onPage} onPick={pick} />
      <GradientSwatches title="Recent" gradients={recents} onPick={pick} />
    </div>
  );
}
