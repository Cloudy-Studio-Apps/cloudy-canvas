import { useSyncExternalStore } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useService } from "../use-service";
import type { DocumentTokensState } from "./tokens.types";

/** The open document's variables, re-read when they change. */
export function useDocumentTokens(): DocumentTokensState {
  const tokens = useService(DOCUMENT_TOKENS);
  useSyncExternalStore(tokens.subscribe, tokens.getVersion);
  return { tokens, store: tokens.store() };
}
