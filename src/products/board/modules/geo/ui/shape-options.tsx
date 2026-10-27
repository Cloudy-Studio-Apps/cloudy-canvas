import { geoVariants } from "../variants/variant.registry";
import { SHAPE_FILLS, SHAPE_STROKES } from "../../../palette";
import { FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { GeoKindIcon } from "./geo-kind-icon";
import { t } from "../geo.i18n";

/** Kind, fill and outline for new shapes; also restyles the selected shapes. */
export function ShapeOptions() {
  const engine = useBoardEngine();
  const shapeKind = useBoardState((state) => state.options.shapeKind);

  return (
    <FloatingPanel role="group" aria-label={t("options.group")} className="gap-1 px-2">
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
      <BoardColorPalette
        option="shapeFill"
        colors={SHAPE_FILLS}
        scopes={["shape-fill"]}
        labelOf={(color) => t("options.fillLabel", { color: color.name })}
      />
      <PanelDivider />
      <BoardColorPalette
        option="shapeStroke"
        colors={SHAPE_STROKES}
        scopes={["stroke-color"]}
        shape="circle"
        labelOf={(color) => t("options.outlineLabel", { color: color.name })}
      />
    </FloatingPanel>
  );
}
