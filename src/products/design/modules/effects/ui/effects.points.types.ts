import type { ComponentType } from "react";

import type { ColorChangeInfo, ExtensionIcon } from "@canvas-ui";
import type { NodeEffect } from "../../core";

/** What an effect's editor gets: the effect, and how to change it. */
export interface EffectEditorProps<E extends NodeEffect = NodeEffect> {
  effect: E;
  /** A drag in the editor reports `{ done: false }` steps, joined into one undo step. */
  onChange: (next: E, info?: ColorChangeInfo) => void;
}

/**
 * A type of effect in the Effects section: its "+" menu item, its row and its editor. Built-ins
 * come from the effects module; plugins add their own (with an `EffectRenderer` on the canvas).
 */
export interface EffectTypeEntry {
  type: string;
  label: string;
  icon: ExtensionIcon;
  /** Position in the "+" menu, lowest first. Built-ins are spaced by 10. */
  order: number;
  /** Shown with a "Beta" tag. */
  beta?: boolean;
  /** Starts a separate group in the menu. */
  separated?: boolean;
  /** A new effect of the type. */
  create(): NodeEffect;
  /** A short line of its values for its row ("0, 4 · 4 blur · 25%"). */
  summary(effect: NodeEffect): string;
  editor: ComponentType<EffectEditorProps>;
}

/** An `EffectTypeEntry` written for one effect type (see `defineEffectType`). */
export type TypedEffectTypeEntry<E extends NodeEffect> = Omit<
  EffectTypeEntry,
  "create" | "summary" | "editor"
> & {
  create(): E;
  summary(effect: E): string;
  editor: ComponentType<EffectEditorProps<E>>;
};
