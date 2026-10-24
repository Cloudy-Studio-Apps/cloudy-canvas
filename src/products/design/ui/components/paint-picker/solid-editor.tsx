import { useMemo } from "react";

import { ColorPicker, ColorSwatches } from "@canvas-ui";
import { useDesignEngine } from "../../design-engine-context";
import { pageColors } from "./page-colors";
import type { SolidEditorProps } from "./paint-picker.types";

/** A solid color: the app's color picker, with the page's colors before the recent ones. */
export function SolidEditor({ paint, onChange }: SolidEditorProps) {
  const engine = useDesignEngine();
  const onPage = useMemo(() => pageColors(engine.elements()), [engine]);

  return (
    <ColorPicker
      color={paint.color}
      opacity={paint.opacity}
      onChange={(color, info, opacity) => onChange({ ...paint, color, opacity }, info)}
      extra={
        <ColorSwatches
          title="On this page"
          colors={onPage}
          onPick={(color) => onChange({ ...paint, color }, { done: true })}
        />
      }
    />
  );
}
