import { GEO_VARIANT_IDS, GEO_VARIANTS, SHAPE_FILLS, SHAPE_STROKES } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel, PanelDivider } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";
import { GeoKindIcon } from "./geo-kind-icon";
import { OptionButton } from "./option-button";

/** Kind, fill and outline for new shapes; also restyles the selected shapes. */
export function ShapeOptions() {
  const engine = useEngine();
  const { shapeKind, shapeFill, shapeStroke } = useEngineState((state) => state.options);

  return (
    <FloatingPanel role="group" aria-label="Shape options" className="gap-1 px-2">
      {GEO_VARIANT_IDS.map((kind) => (
        <OptionButton
          key={kind}
          aria-label={GEO_VARIANTS[kind].label}
          title={GEO_VARIANTS[kind].label}
          selected={shapeKind === kind}
          onClick={() => engine.setToolOptions({ shapeKind: kind })}
        >
          <GeoKindIcon kind={kind} />
        </OptionButton>
      ))}
      <PanelDivider />
      {SHAPE_FILLS.map((color) => (
        <ColorSwatch
          key={color.value}
          label={`${color.name} fill`}
          color={color.value}
          selected={shapeFill === color.value}
          onSelect={() => engine.setToolOptions({ shapeFill: color.value })}
        />
      ))}
      <PanelDivider />
      {SHAPE_STROKES.map((color) => (
        <ColorSwatch
          key={color.value}
          label={`${color.name} outline`}
          color={color.value}
          shape="circle"
          selected={shapeStroke === color.value}
          onSelect={() => engine.setToolOptions({ shapeStroke: color.value })}
        />
      ))}
    </FloatingPanel>
  );
}
