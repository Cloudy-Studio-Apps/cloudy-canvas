import { useMemo } from "react";

import { ColorPicker, ColorSwatches } from "@canvas-ui";
import { useDesignEngine } from "../../design-engine-context";
import { pageColors } from "./page-colors";
import type { SolidEditorProps } from "./paint-picker.types";
import { t } from "../../design-ui.i18n";

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
          title={t("paint.solid.onThisPage")}
          colors={onPage}
          onPick={(color) => onChange({ ...paint, color }, { done: true })}
        />
      }
    />
  );
}
