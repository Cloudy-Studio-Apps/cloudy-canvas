import { useRef, useState } from "react";

import type { ColorChangeInfo } from "@canvas-ui";
import { useEditorModules } from "@canvas-ui";
import type { DesignNode, NodeEffect } from "@design";
import { PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { EffectTypeEntry, PropertySectionProps } from "@design/ui/modules";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { AddEffectMenu } from "./add-effect-menu";
import { EffectRow } from "./effect-row";

/**
 * The selection's effects, topmost first: "+" adds one of the types the modules give (when the
 * layers' effects differ, it replaces them all), each row edits, hides, removes or is dragged to
 * reorder its effect. Editing applies to every selected layer, one undo step per change (a drag
 * in an editor is one).
 */
export function EffectsSection({ selection: { nodes } }: PropertySectionProps) {
  const { host } = useEditorModules();
  const types = [...host.get(designEditor.effectTypes)].sort((a, b) => a.order - b.order);
  const edit = useEditNodes();
  const first = nodes[0]?.effects ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node.effects) !== JSON.stringify(first));
  /** Whether a drag in an editor is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);
  const [moving, setMoving] = useState<{ from: number; to: number } | null>(null);

  const setEffects = (
    change: (current: readonly NodeEffect[]) => NodeEffect[],
    info: ColorChangeInfo = { done: true },
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    edit(nodes, (node: DesignNode) => ({ effects: change(node.effects) }), { checkpoint });
  };
  const add = (entry: EffectTypeEntry) =>
    setEffects((current) => (mixed ? [entry.create()] : [...current, entry.create()]));
  const finishMove = () => {
    if (moving && moving.from !== moving.to) {
      setEffects((current) => {
        const next = [...current];
        const [effect] = next.splice(moving.from, 1);
        if (effect) next.splice(moving.to, 0, effect);
        return next;
      });
    }
    setMoving(null);
  };

  // Listed topmost first, like the layers; `i` stays the index in the stored list.
  const rows = [...first.entries()].reverse();
  return (
    <PanelSection title="Effects" actions={<AddEffectMenu types={types} onAdd={add} />}>
      {mixed ? (
        <p className="text-xs text-muted-foreground">Mixed. Click + to replace them all.</p>
      ) : rows.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {rows.map(([i, effect]) => (
            <EffectRow
              key={effect.id}
              effect={effect}
              entry={host.find(designEditor.effectTypes, effect.type)}
              dragging={moving?.from === i}
              onDragStart={() => setMoving({ from: i, to: i })}
              onDragOver={() => setMoving((m) => (m ? { ...m, to: i } : m))}
              onDragEnd={finishMove}
              onChange={(next, info) =>
                setEffects((current) => current.map((e, j) => (j === i ? next : e)), info)
              }
              onRemove={() => setEffects((current) => current.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      ) : null}
    </PanelSection>
  );
}
