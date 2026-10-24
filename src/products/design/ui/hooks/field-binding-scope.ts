import { createContext } from "react";

import type { FieldBindingScope } from "./field-binding-scope.types";

/**
 * Where the fields inside it bind: unset, to the selected layers; a style's editor sets it so
 * the same paint, effect and number fields bind parts of the style to variables instead.
 */
export const FieldBindingScopeContext = createContext<FieldBindingScope | null>(null);
