import { createContext } from "react";

import type { EffectBindingTarget } from "./effect-binding.types";

/** The effect an editor edits, so its fields can bind to variables; `null` outside the section. */
export const EffectBindingContext = createContext<EffectBindingTarget | null>(null);
