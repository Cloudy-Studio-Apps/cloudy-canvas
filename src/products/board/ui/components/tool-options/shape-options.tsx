import { geoVariants, SHAPE_FILLS, SHAPE_STROKES } from "@board";
import { ColorSwatch, FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";
import { GeoKindIcon } from "./geo-kind-icon";

/** Kind, fill and outline for new shapes; also restyles the selected shapes. */
export function ShapeOptions() {
  const engine = useBoardEngine();
  const { shapeKind, shapeFill, shapeStroke } = useBoardState((state) => state.options);

  return (
    <FloatingPanel role="group" aria-label="Shape options" className="gap-1 px-2">
      {geoVariants.all().map((variant) => (
        <OptionButton
          key={variant.id}
          aria-label={variant.label}
          title={variant.label}
          selected={shapeKind === variant.id}
          onClick={() => engine.setToolOptions({ shapeKind: variant.id })}
        >
          <GeoKindIcon path={variant.icon} />
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
