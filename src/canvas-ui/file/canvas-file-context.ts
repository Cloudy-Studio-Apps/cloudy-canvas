import { createContext, useContext } from "react";

import type { CanvasFileContextValue } from "./canvas-file.types";

export const CanvasFileContext = createContext<CanvasFileContextValue | null>(null);

/** The open editor's file (provided by the product's session with `useCanvasFileSaver`). */
export function useCanvasFile(): CanvasFileContextValue {
  const value = useContext(CanvasFileContext);
  if (!value) throw new Error("useCanvasFile must be used inside <CanvasFileContext value={…}>");
  return value;
}
