import { HIGHLIGHTER_COLORS, MARKER_COLORS } from "@board";
import { ColorPalette } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

/** The current pen's colors, plus any custom one. */
export function DrawColors() {
  const engine = useBoardEngine();
  const { drawPen, markerColor, highlighterColor } = useBoardState((state) => state.options);
  const highlighter = drawPen === "highlighter";

  return (
    <ColorPalette
      colors={highlighter ? HIGHLIGHTER_COLORS : MARKER_COLORS}
      value={highlighter ? highlighterColor : markerColor}
      shape="circle"
      onSelect={(color) =>
        engine.setToolOptions(highlighter ? { highlighterColor: color } : { markerColor: color })
      }
    />
  );
}
