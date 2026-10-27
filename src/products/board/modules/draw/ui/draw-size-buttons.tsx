import { HIGHLIGHTER_SIZES, MARKER_SIZES } from "../../../palette";
import { OptionButton } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../draw.i18n";

/** Largest dot shown for a thickness, so wide highlighters still fit the button. */
const MAX_DOT = 18;

/** The current pen's thickness presets. */
export function DrawSizeButtons() {
  const engine = useBoardEngine();
  const { drawPen, markerSize, highlighterSize, markerColor, highlighterColor } = useBoardState(
    (state) => state.options,
  );
  const highlighter = drawPen === "highlighter";
  const sizes = highlighter ? HIGHLIGHTER_SIZES : MARKER_SIZES;
  const current = highlighter ? highlighterSize : markerSize;
  const color = highlighter ? highlighterColor : markerColor;
  const largest = sizes[sizes.length - 1]!.value;

  return (
    <>
      {sizes.map((size) => {
        const dot = Math.max(4, Math.round((size.value / largest) * MAX_DOT));
        return (
          <OptionButton
            key={size.value}
            aria-label={t("options.stroke", { size: size.name })}
            title={size.name}
            selected={current === size.value}
            onClick={() =>
              engine.setToolOptions(
                highlighter ? { highlighterSize: size.value } : { markerSize: size.value },
              )
            }
          >
            <span
              className="rounded-full border border-black/10"
              style={{ width: dot, height: dot, backgroundColor: color }}
            />
          </OptionButton>
        );
      })}
    </>
  );
}
