import { FloatingPanel, PanelDivider, useEngineState } from "@canvas-ui";
import { DrawColors } from "./draw-colors";
import { DrawModeButtons } from "./draw-mode-buttons";
import { DrawPenButtons } from "./draw-pen-buttons";
import { DrawSizeButtons } from "./draw-size-buttons";

/**
 * The drawing panel: pen, highlighter or eraser, freehand or smooth, thickness and color. With the
 * select tool (selected strokes) it shows only thickness and color.
 */
export function DrawOptions() {
  const tool = useEngineState((state) => state.tool);
  const selecting = tool === "select";
  const erasing = tool === "eraser";

  return (
    <FloatingPanel role="group" aria-label="Drawing options" className="gap-1 px-2">
      {!selecting && (
        <>
          <DrawPenButtons />
          {!erasing && (
            <>
              <PanelDivider />
              <DrawModeButtons />
            </>
          )}
        </>
      )}
      {!erasing && (
        <>
          {!selecting && <PanelDivider />}
          <DrawSizeButtons />
          <PanelDivider />
          <DrawColors />
        </>
      )}
    </FloatingPanel>
  );
}
