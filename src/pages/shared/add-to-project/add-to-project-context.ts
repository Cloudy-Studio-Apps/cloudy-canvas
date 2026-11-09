import { createContext, useContext } from "react";

import type { AddToProjectRequest } from "./add-to-project-context.types";

export const AddToProjectContext = createContext<AddToProjectRequest | null>(null);

/** Opens the Add to project dialog for a file; `null` outside an `AddToProjectProvider`. */
export function useAddToProject(): AddToProjectRequest | null {
  return useContext(AddToProjectContext);
}
