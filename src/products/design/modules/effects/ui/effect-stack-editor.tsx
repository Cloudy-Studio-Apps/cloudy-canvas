import { useState } from "react";

import { useEditorModules } from "@canvas-ui";
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
  const [moving, setMoving] = useState<{ from: number; to: number } | null>(null);
  const finishMove = () => {
    if (moving && moving.from !== moving.to) {
      onChange(
        (current) => {
          const next = [...current];
          const [effect] = next.splice(moving.from, 1);
          if (effect) next.splice(moving.to, 0, effect);
          return next;
        },
        undefined,
        movedTo(moving.from, moving.to),
      );
    }
    setMoving(null);
  };

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
            dragging={moving?.from === i}
            onDragStart={() => setMoving({ from: i, to: i })}
            onDragOver={() => setMoving((m) => (m ? { ...m, to: i } : m))}
            onDragEnd={finishMove}
            onChange={(next, info) =>
              onChange((current) => current.map((e, j) => (j === i ? next : e)), info)
            }
            onRemove={() =>
              onChange((current) => current.filter((_, j) => j !== i), undefined, removedAt(i))
            }
          />
        </EffectBindingContext.Provider>
      ))}
    </div>
  );
}
