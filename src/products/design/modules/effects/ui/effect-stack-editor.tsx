import { DragGhost, rowDropIndex, useEditorModules, useRowDrag } from "@canvas-ui";
import { movedTo, removedAt } from "../../core";
import { EffectBindingContext } from "./effect-binding-context";
import { EffectRow } from "./effect-row";
import type { EffectStackEditorProps } from "./effects-ui.types";
import { designEffectTypes } from "./effects.points";
import { t } from "../effects.i18n";

/**
 * An effects stack, topmost first like the layers: each row edits, hides, removes or is dragged
 * to reorder its effect. The Effects section's list and an effect style's editor.
 */
export function EffectStackEditor({ effects, mixed, onChange, nodes }: EffectStackEditorProps) {
  const { host } = useEditorModules();
  const rowDrag = useRowDrag({
    onDrop: (id, overId, side) => {
      // Listed topmost first, so the row's place in the list is the stored index turned around.
      const shown = [...effects].reverse().map((effect) => effect.id);
      const last = effects.length - 1;
      const from = last - shown.indexOf(id);
      const to = last - rowDropIndex(shown.indexOf(id), shown.indexOf(overId), side);
      if (from === to) return;
      onChange(
        (current) => {
          const next = [...current];
          const [effect] = next.splice(from, 1);
          if (effect) next.splice(to, 0, effect);
          return next;
        },
        undefined,
        movedTo(from, to),
      );
    },
  });
  const dragged = effects.find((effect) => effect.id === rowDrag.drag?.id);

  if (mixed) {
    return <p className="text-xs text-muted-foreground">{t("stack.mixed")}</p>;
  }
  if (effects.length === 0) return null;
  // Listed topmost first; `i` stays the index in the stored list.
  return (
    <div className="flex flex-col gap-1.5">
      {[...effects.entries()].reverse().map(([i, effect]) => (
        <EffectBindingContext.Provider key={effect.id} value={{ nodes, index: i }}>
          <EffectRow
            effect={effect}
            entry={host.find(designEffectTypes, effect.type)}
            rowDrag={rowDrag}
            onChange={(next, info) =>
              onChange((current) => current.map((e, j) => (j === i ? next : e)), info)
            }
            onRemove={() =>
              onChange((current) => current.filter((_, j) => j !== i), undefined, removedAt(i))
            }
          />
        </EffectBindingContext.Provider>
      ))}
      {dragged && rowDrag.drag && (
        <DragGhost
          label={host.find(designEffectTypes, dragged.type)?.label ?? dragged.type}
          pointer={rowDrag.drag.pointer}
        />
      )}
    </div>
  );
}
