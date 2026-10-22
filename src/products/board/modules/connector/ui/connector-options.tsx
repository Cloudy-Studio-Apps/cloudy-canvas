import { CornerDownRight, MoveRight } from "lucide-react";

import { LINE_COLORS } from "@board";
import { ColorSwatch, FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { CONNECTOR_HEADS, CONNECTOR_STYLES } from "./connector-option-items";

const STYLE_ICONS = { elbow: CornerDownRight, straight: MoveRight };

/** Line style, color and arrowheads for new connectors; also restyles the selected connectors. */
export function ConnectorOptions() {
  const engine = useBoardEngine();
  const { connectorStyle, connectorColor, connectorStartHead, connectorEndHead } = useBoardState(
    (state) => state.options,
  );

  return (
    <FloatingPanel role="group" aria-label="Connector options" className="gap-1 px-2">
      {CONNECTOR_STYLES.map(({ style, label }) => {
        const Icon = STYLE_ICONS[style];
        return (
          <OptionButton
            key={style}
            aria-label={label}
            title={label}
            selected={connectorStyle === style}
            onClick={() => engine.setToolOptions({ connectorStyle: style })}
          >
            <Icon className="size-[18px]" />
          </OptionButton>
        );
      })}
      <PanelDivider />
      {CONNECTOR_HEADS.map(({ start, end, label, glyph }) => (
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
      {LINE_COLORS.map((color) => (
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
