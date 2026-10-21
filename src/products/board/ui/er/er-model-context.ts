import { createContext, useContext } from "react";

import type { ErModel } from "@board";

/** The open board's ER diagrams (see `useErModelOf`). */
export const ErModelContext = createContext<ErModel | null>(null);

export function useErModel(): ErModel {
  const er = useContext(ErModelContext);
  if (!er) throw new Error("useErModel must be used inside a board session.");
  return er;
}
