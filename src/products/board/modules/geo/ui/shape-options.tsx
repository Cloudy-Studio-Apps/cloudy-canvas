import { geoVariants, SHAPE_FILLS, SHAPE_STROKES } from "@board";
import { ColorPalette, FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
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
      <ColorPalette
        colors={SHAPE_FILLS}
        value={shapeFill}
        labelOf={(color) => `${color.name} fill`}
        onSelect={(color) => engine.setToolOptions({ shapeFill: color })}
      />
      <PanelDivider />
      <ColorPalette
        colors={SHAPE_STROKES}
        value={shapeStroke}
        shape="circle"
        labelOf={(color) => `${color.name} outline`}
        onSelect={(color) => engine.setToolOptions({ shapeStroke: color })}
      />
    </FloatingPanel>
  );
}
