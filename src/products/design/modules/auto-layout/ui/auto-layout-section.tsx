import { Minus } from "lucide-react";

import { addAutoLayout, layoutOf, removeAutoLayout } from "@design";
import { PanelAddButton, PanelIconButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { AutoLayoutFields } from "./auto-layout-fields";

/**
 * For selected frames: their auto layout (direction, gaps, padding, alignment, strokes and
 * stacking), "+" to add one (Shift+A) and "−" to remove it (Alt+Shift+A).
 */
export function AutoLayoutSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const ids = new Set(nodes.map((node) => node.id));
  const all = nodes.every((node) => layoutOf(node));
  const some = nodes.some((node) => layoutOf(node));
  const add = () => addAutoLayout(engine.doc, ids, engine.elements(), engine.kinds);
  const remove = () => removeAutoLayout(engine.doc, ids, engine.elements());
  const label = (command: string, text: string) => {
    const keys = engine.keymap.label(command);
    return keys ? `${text} (${keys})` : text;
  };

  return (
    <PanelSection
      title="Auto layout"
      actions={
        some ? (
          <PanelIconButton label={label("removeAutoLayout", "Remove auto layout")} onClick={remove}>
            <Minus />
          </PanelIconButton>
        ) : (
          <PanelAddButton label={label("addAutoLayout", "Add auto layout")} onClick={add} />
        )
      }
    >
      {all && <AutoLayoutFields frames={nodes} />}
    </PanelSection>
  );
}
