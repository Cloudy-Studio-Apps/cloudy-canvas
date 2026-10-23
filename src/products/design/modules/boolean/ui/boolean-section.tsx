import { Combine } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { BOOLEAN_OPERATIONS, BOOLEAN_TYPE, type BooleanElement, type DesignNode } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { NodeOptionButtons, PanelIconButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { BOOLEAN_COMMANDS, BOOLEAN_ICONS } from "./boolean-icons";

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
    <PanelSection title="Boolean">
      <div className="flex flex-col gap-2">
        {booleans ? (
          <NodeOptionButtons
            nodes={nodes as readonly BooleanElement[]}
            label="Operation"
            read={(node) => node.operation}
            patch={(operation) => ({ operation }) as ElementPatch<DesignNode>}
            options={BOOLEAN_OPERATIONS.map(({ operation, label }) => {
              const Icon = BOOLEAN_ICONS[operation];
              return { value: operation, label, icon: <Icon /> };
            })}
          />
        ) : (
          <div role="group" aria-label="Combine" className="flex rounded-sm bg-muted p-0.5">
            {BOOLEAN_OPERATIONS.map(({ operation, label }) => {
              const Icon = BOOLEAN_ICONS[operation];
              const command = BOOLEAN_COMMANDS[operation];
              return (
                <PanelIconButton
                  key={operation}
                  label={`${label}${shortcut(command)}`}
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
          Flatten
          <span className="ml-auto text-xs text-muted-foreground">
            {engine.keymap.label("flatten")}
          </span>
        </Button>
      </div>
    </PanelSection>
  );
}
