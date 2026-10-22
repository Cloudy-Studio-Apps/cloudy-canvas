import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  LayoutGrid,
} from "lucide-react";

import { BASE_COMMAND_LABELS } from "@canvas";
import { useEngine } from "@canvas-ui";
import { PanelIconButton } from "@design/ui/components/panel";
import type { ArrangeButton, ArrangeButtonsProps } from "./arrange-buttons.types";

const ALIGN: readonly ArrangeButton[] = [
  { command: "alignLeft", icon: AlignStartVertical },
  { command: "alignCenterX", icon: AlignCenterVertical },
  { command: "alignRight", icon: AlignEndVertical },
  { command: "alignTop", icon: AlignStartHorizontal },
  { command: "alignCenterY", icon: AlignCenterHorizontal },
  { command: "alignBottom", icon: AlignEndHorizontal },
];

const SPREAD: readonly ArrangeButton[] = [
  { command: "distributeHorizontal", icon: AlignHorizontalSpaceAround, min: 3 },
  { command: "distributeVertical", icon: AlignVerticalSpaceAround, min: 3 },
  { command: "tidyUp", icon: LayoutGrid, min: 2 },
];

/**
 * The selection's align, distribute and tidy up buttons (the engine's commands, so one layer
 * aligns with the frame it's in).
 */
export function ArrangeButtons({ nodes }: ArrangeButtonsProps) {
  const engine = useEngine();
  const canAlign = engine.canAlign(nodes.map((node) => node.id));

  const button = ({ command, icon: Icon, min }: ArrangeButton, enabled: boolean) => {
    const keys = engine.keymap.label(command);
    const name = BASE_COMMAND_LABELS[command as keyof typeof BASE_COMMAND_LABELS];
    return (
      <PanelIconButton
        key={command}
        label={keys ? `${name} (${keys})` : name}
        disabled={!enabled || nodes.length < (min ?? 0)}
        onClick={() => engine.commands[command]?.()}
      >
        <Icon />
      </PanelIconButton>
    );
  };

  return (
    <div className="mb-2 flex justify-between rounded-sm bg-muted p-0.5">
      {ALIGN.map((item) => button(item, canAlign))}
      <span className="mx-0.5 my-1 w-px bg-border" />
      {SPREAD.map((item) => button(item, true))}
    </div>
  );
}
