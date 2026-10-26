import { HIGHLIGHTER_COLORS, MARKER_COLORS } from "@board";
import { ColorPalette } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

/** The current pen's colors, plus any custom one (a pen's can be a board color too). */
export function DrawColors() {
  const engine = useBoardEngine();
  const { drawPen, highlighterColor } = useBoardState((state) => state.options);

  if (drawPen !== "highlighter") {
    return (
      <BoardColorPalette
        option="markerColor"
        colors={MARKER_COLORS}
        scopes={["stroke-color"]}
        shape="circle"
      />
    );
  }
  return (
    <ColorPalette
      colors={HIGHLIGHTER_COLORS}
      value={highlighterColor}
      shape="circle"
      onSelect={(color) => engine.setToolOptions({ highlighterColor: color })}
    />
  );
}
