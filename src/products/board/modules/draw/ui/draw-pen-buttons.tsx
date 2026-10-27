import { Eraser, Highlighter, Pen } from "lucide-react";

import { OptionButton, useEngineState } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../draw.i18n";

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
        aria-label={t("options.pen")}
        title={t("options.pen")}
        selected={!erasing && drawPen === "pen"}
        onClick={() => {
          engine.setToolOptions({ drawPen: "pen" });
          engine.setTool("marker");
        }}
      >
        <Pen className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label={t("options.highlighter")}
        title={t("options.highlighter")}
        selected={!erasing && drawPen === "highlighter"}
        onClick={() => {
          engine.setToolOptions({ drawPen: "highlighter" });
          engine.setTool("marker");
        }}
      >
        <Highlighter className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label={t("options.eraser")}
        title={
          eraserShortcut
            ? t("options.eraserShortcut", { shortcut: eraserShortcut })
            : t("options.eraser")
        }
        selected={erasing}
        onClick={() => engine.setTool("eraser")}
      >
        <Eraser className="size-4" />
      </OptionButton>
    </>
  );
}
