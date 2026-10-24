import { useRef } from "react";

import type { ColorChangeInfo } from "@canvas-ui";
import { useEditorModules } from "@canvas-ui";
import {
  EFFECT_STYLE,
  effectBindingsOf,
  effectStyleOfNode,
  stackBindingsPatch,
  type DesignNode,
  type NodeEffect,
} from "@design";
import { PanelSection } from "@design/ui/components/panel";
import {
  createNodeStyle,
  StyleChip,
  StyleControl,
  useNodeStyleBinding,
} from "@design/ui/components/styles";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { EffectTypeEntry, PropertySectionProps } from "@design/ui/modules";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { AddEffectMenu } from "./add-effect-menu";
import { EffectStackEditor } from "./effect-stack-editor";
import type { EffectStackMap } from "./effects-ui.types";

/**
 * The selection's effects (`EffectStackEditor`): "+" adds one of the types the modules give
 * (when the layers' effects differ, it replaces them all). Its header applies an effect style or
 * saves the effects as one; while one is applied, the section shows it instead. Editing applies
 * to every selected layer, one undo step per change (a drag in an editor is one).
 */
export function EffectsSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const types = [...host.get(designEditor.effectTypes)].sort((a, b) => a.order - b.order);
  const edit = useEditNodes();
  const style = useNodeStyleBinding(nodes, "effects");
  const first = nodes[0]?.effects ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node.effects) !== JSON.stringify(first));
  /** Whether a drag in an editor is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);

  const setEffects = (
    change: (current: readonly NodeEffect[]) => NodeEffect[],
    info: ColorChangeInfo = { done: true },
    map?: EffectStackMap,
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    edit(
      nodes,
      (node: DesignNode) => ({
        effects: change(node.effects),
        ...(map === undefined ? {} : stackBindingsPatch(node, "effects", map)),
      }),
      { checkpoint },
    );
  };
  const add = (entry: EffectTypeEntry) =>
    setEffects(
      (current) => (mixed ? [entry.create()] : [...current, entry.create()]),
      undefined,
      mixed ? null : undefined,
    );

  return (
    <PanelSection
      title="Effects"
      actions={
        <>
          <StyleControl
            binding={style}
            styleType={EFFECT_STYLE}
            createLabel="Create style from these effects"
            create={() =>
              createNodeStyle(engine, EFFECT_STYLE, effectStyleOfNode, effectBindingsOf)
            }
          />
          {style.bound === undefined && <AddEffectMenu types={types} onAdd={add} />}
        </>
      }
    >
      {style.bound !== undefined ? (
        <StyleChip binding={style} />
      ) : (
        <EffectStackEditor effects={first} mixed={mixed} onChange={setEffects} nodes={nodes} />
      )}
    </PanelSection>
  );
}
