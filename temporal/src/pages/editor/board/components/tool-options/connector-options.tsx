import { CornerDownRight, MoveRight } from "lucide-react";

import { MARKER_COLORS, type ArrowHead, type ConnectorStyle } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel, PanelDivider } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";
import { OptionButton } from "./option-button";

const STYLES: { style: ConnectorStyle; label: string; icon: typeof MoveRight }[] = [
  { style: "elbow", label: "Elbow", icon: CornerDownRight },
  { style: "straight", label: "Straight", icon: MoveRight },
];

/** Arrowhead combinations, drawn as small line previews. */
const HEADS: { start: ArrowHead; end: ArrowHead; label: string; glyph: string }[] = [
  { start: "none", end: "arrow", label: "Arrow at end", glyph: "→" },
  { start: "arrow", end: "arrow", label: "Arrows at both ends", glyph: "↔" },
  { start: "none", end: "none", label: "No arrows", glyph: "—" },
];

/** Line style, color and arrowheads for new connectors; also restyles the selected connectors. */
export function ConnectorOptions() {
  const engine = useEngine();
  const { connectorStyle, connectorColor, connectorStartHead, connectorEndHead } = useEngineState(
    (state) => state.options,
  );

  return (
    <FloatingPanel role="group" aria-label="Connector options" className="gap-1 px-2">
      {STYLES.map(({ style, label, icon: Icon }) => (
        <OptionButton
          key={style}
          aria-label={label}
          title={label}
          selected={connectorStyle === style}
          onClick={() => engine.setToolOptions({ connectorStyle: style })}
        >
          <Icon className="size-[18px]" />
        </OptionButton>
      ))}
      <PanelDivider />
      {HEADS.map(({ start, end, label, glyph }) => (
        <OptionButton
          key={label}
          aria-label={label}
          title={label}
          selected={connectorStartHead === start && connectorEndHead === end}
          onClick={() =>
            engine.setToolOptions({ connectorStartHead: start, connectorEndHead: end })
          }
        >
          <span className="text-base leading-none">{glyph}</span>
        </OptionButton>
      ))}
      <PanelDivider />
      {MARKER_COLORS.map((color) => (
        <ColorSwatch
          key={color.value}
          label={color.name}
          color={color.value}
          shape="circle"
          selected={connectorColor === color.value}
          onSelect={() => engine.setToolOptions({ connectorColor: color.value })}
        />
      ))}
    </FloatingPanel>
  );
}
