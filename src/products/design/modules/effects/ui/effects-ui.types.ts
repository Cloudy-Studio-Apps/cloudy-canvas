import type { ColorChangeInfo } from "@canvas-ui";
import type { NodeEffect } from "@design";
import type { EffectTypeEntry } from "@design/ui/modules";

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
