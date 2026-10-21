import { Eraser, Highlighter, Pen } from "lucide-react";

import { OptionButton, useEngineState } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

/** Pen, highlighter or eraser. The pens are the marker tool's options; the eraser is its own tool. */
export function DrawPenButtons() {
  const engine = useBoardEngine();
  const tool = useEngineState((state) => state.tool);
  const drawPen = useBoardState((state) => state.options.drawPen);
  const erasing = tool === "eraser";
  const eraserShortcut = engine.keymap.label("tool.eraser");

  return (
    <>
      <OptionButton
        aria-label="Pen"
        title="Pen"
        selected={!erasing && drawPen === "pen"}
        onClick={() => {
          engine.setToolOptions({ drawPen: "pen" });
          engine.setTool("marker");
        }}
      >
        <Pen className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label="Highlighter"
        title="Highlighter"
        selected={!erasing && drawPen === "highlighter"}
        onClick={() => {
          engine.setToolOptions({ drawPen: "highlighter" });
          engine.setTool("marker");
        }}
      >
        <Highlighter className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label="Eraser"
        title={eraserShortcut ? `Eraser (${eraserShortcut})` : "Eraser"}
        selected={erasing}
        onClick={() => engine.setTool("eraser")}
      >
        <Eraser className="size-4" />
      </OptionButton>
    </>
  );
}
