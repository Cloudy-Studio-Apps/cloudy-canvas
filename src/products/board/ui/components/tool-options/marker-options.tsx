import { MARKER_COLORS, MARKER_SIZES } from "@board";
import { ColorSwatch, FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

export function MarkerOptions() {
  const engine = useBoardEngine();
  const { markerColor, markerSize } = useBoardState((state) => state.options);

  return (
    <FloatingPanel role="group" aria-label="Marker options" className="gap-1 px-2">
      {MARKER_COLORS.map((color) => (
        <ColorSwatch
          key={color.value}
          label={color.name}
          color={color.value}
          shape="circle"
          selected={markerColor === color.value}
          onSelect={() => engine.setToolOptions({ markerColor: color.value })}
        />
      ))}
      <PanelDivider />
      {MARKER_SIZES.map((size) => (
        <OptionButton
          key={size.value}
          aria-label={`${size.name} stroke`}
          selected={markerSize === size.value}
          onClick={() => engine.setToolOptions({ markerSize: size.value })}
        >
          <span
            className="rounded-full"
            style={{ width: size.value + 2, height: size.value + 2, backgroundColor: markerColor }}
          />
        </OptionButton>
      ))}
    </FloatingPanel>
  );
}
