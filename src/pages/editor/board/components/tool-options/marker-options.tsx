import { MARKER_COLORS, MARKER_SIZES } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel, PanelDivider } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";
import { OptionButton } from "./option-button";

export function MarkerOptions() {
  const engine = useEngine();
  const { markerColor, markerSize } = useEngineState((state) => state.options);

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
