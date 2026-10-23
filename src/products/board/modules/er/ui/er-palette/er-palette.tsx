import { ER_MODE_COMMANDS, ER_MODE_ID, erClickActions } from "@board";
import { rectCenter } from "@canvas";
import { FloatingPanel, useEngine, useEngineState } from "@canvas-ui";
import { useErDiagram, useErModel, useErSelection, useErShape, useErShapes } from "../model";
import { ErPaletteButton } from "./er-palette-button";
import { ER_PALETTE_ITEMS } from "./er-palette-items";

/**
 * The ER element types along the canvas's left edge: always while the ER mode is on, otherwise
 * while an ER element is selected or the ER tool is on. Each one is clicked to add it to the shown
 * diagram (placed next to what it belongs to) or dragged onto the board, where it lands and
 * attaches to what it's dropped on. With no diagram shown yet, an entity starts one.
 */
export function ErPalette() {
  const engine = useEngine();
  const er = useErModel();
  const selection = useErSelection();
  const inMode = useEngineState((state) => state.mode === ER_MODE_ID);
  const erTool = useEngineState((state) => state.tool === "er");
  const diagram = useErDiagram();
  const shapes = useErShapes();
  const selected = useErShape(selection.id ?? "");

  if (!inMode && !((selection.any || erTool) && diagram.id)) return null;
  // The ER mode's keys, shown in the tooltips while it's on.
  const shortcutOf = (item: string) => {
    const command = inMode ? ER_MODE_COMMANDS.find((c) => c.item === item)?.command : undefined;
    return command ? engine.keymap.label(command) : undefined;
  };
  // A diagram that was shown and is gone (all its shapes deleted) counts as none.
  const shown = diagram.id && shapes.entities.length + shapes.relations.length > 0;
  const actions = erClickActions(er, diagram.id || null, selected?.id ?? null, () =>
    rectCenter(engine.visibleWorldRect()),
  );

  return (
    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
      <FloatingPanel role="toolbar" aria-label="ER elements" className="flex-col">
        {ER_PALETTE_ITEMS.map((item) => {
          const action = actions[item.id];
          return (
            <ErPaletteButton
              key={item.id}
              item={item}
              diagram={shown ? diagram : undefined}
              clickLabel={action.label}
              shortcut={shortcutOf(item.id)}
              clickDisabled={action.disabled}
              blocked={action.blocked === true}
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
