import { createContext, useContext } from "react";

export const FieldIdContext = createContext<string | undefined>(undefined);

/** The id of the `Field` this control is in, for its input's `id`. */
export function useFieldId(): string | undefined {
  return useContext(FieldIdContext);
}
