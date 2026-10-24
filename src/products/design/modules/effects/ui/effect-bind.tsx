import { useContext } from "react";

import { BindSlot } from "@design/ui/components/panel";
import { EffectBindingContext } from "./effect-binding-context";
import type { EffectBindProps } from "./effect-binding.types";

/** An effect editor's field that can come from a variable (when the editor knows its layers). */
export function EffectBind({ field, children }: EffectBindProps) {
  const target = useContext(EffectBindingContext);
  if (!target) return children;
  return (
    <BindSlot nodes={target.nodes} path={`effects.${target.index}.${field}`}>
      {children}
    </BindSlot>
  );
}
