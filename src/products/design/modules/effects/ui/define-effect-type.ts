import type { ComponentType } from "react";

import type { NodeEffect } from "../../core";
import type {
  EffectEditorProps,
  EffectTypeEntry,
  TypedEffectTypeEntry,
} from "./effects.points.types";

/**
 * An `effectTypes` entry typed by its effect, so its `create`, `summary` and `editor` work on the
 * type's own fields (built-ins and plugins write theirs with it).
 */
export function defineEffectType<E extends NodeEffect>(
  entry: TypedEffectTypeEntry<E>,
): EffectTypeEntry {
  return {
    ...entry,
    summary: (effect) => entry.summary(effect as E),
    editor: entry.editor as unknown as ComponentType<EffectEditorProps>,
  };
}
