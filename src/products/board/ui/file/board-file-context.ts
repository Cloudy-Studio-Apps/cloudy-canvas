import { createContext, useContext } from "react";

import type { BoardFileContextValue } from "./board-file-context.types";

export const BoardFileContext = createContext<BoardFileContextValue | null>(null);

export function useBoardFile(): BoardFileContextValue {
  const value = useContext(BoardFileContext);
  if (!value) throw new Error("useBoardFile must be used inside <BoardFileContext value={…}>");
  return value;
}
