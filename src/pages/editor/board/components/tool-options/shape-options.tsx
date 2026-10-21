import { GEO_KINDS, SHAPE_FILLS, SHAPE_STROKES } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel, PanelDivider } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";
import { GeoKindIcon } from "./geo-kind-icon";
import { GEO_KIND_LABELS } from "./geo-kind-labels";
import { OptionButton } from "./option-button";

/** Kind, fill and outline for new shapes; also restyles the selected shapes. */
export function ShapeOptions() {
  const engine = useEngine();
  const { shapeKind, shapeFill, shapeStroke } = useEngineState((state) => state.options);

  return (
    <FloatingPanel role="group" aria-label="Shape options" className="gap-1 px-2">
      {GEO_KINDS.map((kind) => (
        <OptionButton
          key={kind}
          aria-label={GEO_KIND_LABELS[kind]}
          title={GEO_KIND_LABELS[kind]}
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
