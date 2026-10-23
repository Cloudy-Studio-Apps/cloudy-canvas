import { ER_MODE_TOOL, erAddActions } from "@board";
import { FloatingPanel, useEngine, useEngineState } from "@canvas-ui";
import { useErDiagram, useErSelection, useErShape, useErShapes } from "../model";
import { ErPaletteButton } from "./er-palette-button";
import { ER_PALETTE_ITEMS } from "./er-palette-items";

/**
 * The ER element types along the canvas's left edge, shown while an ER element is selected, the ER
 * tool is on or the ER mode is (always, then). Each one is clicked to add it to the shown diagram (placed next to what it
 * belongs to) or dragged onto the board, where it lands and attaches to what it's dropped on.
 */
export function ErPalette() {
  const engine = useEngine();
  const selection = useErSelection();
  const erTool = useEngineState((state) => state.tool === "er" || state.tool === ER_MODE_TOOL);
  const diagram = useErDiagram();
  const shapes = useErShapes();
  const selected = useErShape(selection.id ?? "");

  if (!(selection.any || erTool) || !diagram.id) return null;
  const actions = erAddActions(diagram.edits, shapes, selected);

  return (
    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
      <FloatingPanel role="toolbar" aria-label="ER elements" className="flex-col">
        {ER_PALETTE_ITEMS.map((item) => {
          const action = actions[item.id];
          return (
            <ErPaletteButton
              key={item.id}
              item={item}
              diagram={diagram}
              clickLabel={action.label}
              clickDisabled={action.disabled}
              onClick={() => {
                const id = action.run();
                if (id) engine.focusElement(id);
              }}
            />
          );
        })}
      </FloatingPanel>
    </div>
  );
}
