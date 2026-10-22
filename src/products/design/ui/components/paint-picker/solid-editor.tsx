import { useMemo } from "react";

import { useDesignEngine } from "../../design-engine-context";
import { usePaintRecentsStore } from "../../stores/paint-recents-store";
import { ColorControls } from "./color-controls";
import { ColorSwatches } from "./color-swatches";
import { pageColors } from "./page-colors";
import type { SolidEditorProps } from "./paint-picker.types";

/** A solid color: its color controls, then the page's colors and the recent ones. */
export function SolidEditor({ paint, onChange }: SolidEditorProps) {
  const engine = useDesignEngine();
  const recents = usePaintRecentsStore((state) => state.colors);
  const addRecent = usePaintRecentsStore((state) => state.add);
  const onPage = useMemo(() => pageColors(engine.elements()), [engine]);
  const pick = (color: string) => {
    onChange({ ...paint, color }, { done: true });
    addRecent(color);
  };

  return (
    <div className="space-y-3">
      <ColorControls
        color={paint.color}
        opacity={paint.opacity}
        onChange={(next, info) => {
          onChange({ ...paint, ...next }, info);
          if (info.done) addRecent(next.color);
        }}
      />
      <ColorSwatches title="On this page" colors={onPage} onPick={pick} />
      <ColorSwatches title="Recent" colors={recents} onPick={pick} />
    </div>
  );
}
