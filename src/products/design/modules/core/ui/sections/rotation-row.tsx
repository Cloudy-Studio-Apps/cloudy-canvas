import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from "lucide-react";

import { normalizeAngle, type CanvasElement } from "@canvas";
import { NumberField, PanelIconButton, sharedValue } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { DesignNodeKind } from "../../node";
import type { RotationRowProps } from "./rotation-row.types";
import { t } from "../../core.i18n";

const BUTTONS = [
  { command: "rotateLeft", label: t("commands.rotateLeft"), icon: RotateCcw },
  { command: "rotateRight", label: t("commands.rotateRight"), icon: RotateCw },
  { command: "flipHorizontal", label: t("commands.flipHorizontal"), icon: FlipHorizontal2 },
  { command: "flipVertical", label: t("commands.flipVertical"), icon: FlipVertical2 },
] as const;

/**
 * The selection's angle (each layer turns round its own middle to the typed one), and buttons
 * that turn it a quarter round or flip it.
 */
export function RotationRow({ nodes }: RotationRowProps) {
  const engine = useDesignEngine();
  const turnOf = (el: CanvasElement) => {
    const kind = engine.kinds.kindOf(el);
    return kind instanceof DesignNodeKind ? kind.turnOf(el) : 0;
  };
  const turnTo = (angle: number) =>
    engine.rotateElements(
      nodes.map((node) => node.id),
      (el) => normalizeAngle(angle - turnOf(el)),
      "each",
    );

  return (
    <div className="mt-2 flex items-center gap-1">
      <NumberField
        prefix={<RotateCw />}
        label={t("fields.rotation")}
        suffix="°"
        className="flex-1"
        value={sharedValue(nodes, (node) => Math.round(turnOf(node) * 100) / 100)}
        onCommit={turnTo}
      />
      {BUTTONS.map(({ command, label, icon: Icon }) => {
        const keys = engine.keymap.label(command);
        return (
          <PanelIconButton
            key={command}
            label={keys ? `${label} (${keys})` : label}
            onClick={() => engine.commands[command]?.()}
          >
            <Icon />
          </PanelIconButton>
        );
      })}
    </div>
  );
}
