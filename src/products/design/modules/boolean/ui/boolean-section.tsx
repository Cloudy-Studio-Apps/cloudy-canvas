import { Combine } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { BOOLEAN_OPERATIONS, BOOLEAN_TYPE } from "../boolean.constants";
import type { BooleanElement } from "../boolean.types";
import type { DesignNode } from "../../core";
import { Button } from "@shared/ui/kit";
import { NodeOptionButtons, PanelIconButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { BOOLEAN_COMMANDS, BOOLEAN_ICONS } from "./boolean-icons";
import { t } from "../boolean.i18n";

/**
 * Booleans in the properties panel: for selected booleans their operation, for several other
 * layers the four operations that combine them; and Flatten (baking them into a vector).
 */
export function BooleanSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  // One boolean: its operation. Several layers (booleans too): combine them into a new one.
  const [only] = nodes;
  const booleans = nodes.length === 1 && only?.type === BOOLEAN_TYPE;
  const shortcut = (command: string) => {
    const keys = engine.keymap.label(command);
    return keys ? ` (${keys})` : "";
  };
  return (
    <PanelSection title={t("title")}>
      <div className="flex flex-col gap-2">
        {booleans ? (
          <NodeOptionButtons
            nodes={nodes as readonly BooleanElement[]}
            label={t("panel.operation")}
            read={(node) => node.operation}
            patch={(operation) => ({ operation }) as ElementPatch<DesignNode>}
            options={BOOLEAN_OPERATIONS.map(({ operation }) => {
              const Icon = BOOLEAN_ICONS[operation];
              return { value: operation, label: t(`operations.${operation}`), icon: <Icon /> };
            })}
          />
        ) : (
          <div
            role="group"
            aria-label={t("panel.combine")}
            className="flex rounded-sm bg-muted p-0.5"
          >
            {BOOLEAN_OPERATIONS.map(({ operation }) => {
              const Icon = BOOLEAN_ICONS[operation];
              const command = BOOLEAN_COMMANDS[operation];
              return (
                <PanelIconButton
                  key={operation}
                  label={`${t(`operations.${operation}`)}${shortcut(command)}`}
                  onClick={() => engine.commands[command]?.()}
                >
                  <Icon />
                </PanelIconButton>
              );
            })}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => engine.commands.flatten?.()}
        >
          <Combine />
          {t("commands.flatten")}
          <span className="ml-auto text-xs text-muted-foreground">
            {engine.keymap.label("flatten")}
          </span>
        </Button>
      </div>
    </PanelSection>
  );
}
