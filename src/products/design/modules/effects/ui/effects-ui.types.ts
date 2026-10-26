import type { ColorChangeInfo } from "@canvas-ui";
import type { DesignNode, NodeEffect } from "@design";
import type { EffectTypeEntry } from "./effects.points.types";

export interface AddEffectMenuProps {
  types: readonly EffectTypeEntry[];
  onAdd: (entry: EffectTypeEntry) => void;
}

export interface EffectRowProps {
  effect: NodeEffect;
  /** Its type's entry; `undefined` for a type no module knows (shown, but not editable). */
  entry: EffectTypeEntry | undefined;
  onChange: (next: NodeEffect, info?: ColorChangeInfo) => void;
  onRemove: () => void;
  /** Drag handle events, so rows can be reordered. */
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
}

/** Where each effect's variables go after a change (`null`: the stack was replaced). */
export type EffectStackMap = ((index: number) => number | null) | null;

export interface EffectStackEditorProps {
  effects: readonly NodeEffect[];
  /** The targets' stacks differ ("+" replaces them all). */
  mixed: boolean;
  /** Changes the stack; `map` says where each effect's variables go (unset: they stay). */
  onChange: (
    change: (current: readonly NodeEffect[]) => NodeEffect[],
    info?: ColorChangeInfo,
    map?: EffectStackMap,
  ) => void;
  /** The layers edited, so fields bind on them (a style's editor binds through its scope). */
  nodes: readonly DesignNode[];
}
