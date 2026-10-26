import { createContext, useContext } from "react";

import type { ThemePartsContextValue } from "./theme.types";

/** The theme the previews show and the part under the pointer, shared by their parts. */
export const ThemePartsContext = createContext<ThemePartsContextValue | null>(null);

export function useThemeParts(): ThemePartsContextValue {
  const value = useContext(ThemePartsContext);
  if (!value) throw new Error("A theme part must be inside ThemePartsContext.");
  return value;
}
