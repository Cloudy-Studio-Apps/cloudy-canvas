import { useEditorModules } from "@canvas-ui";

import { tokenFormats, type TokenFormat } from "../../exchange";

/** The token formats every module contributed, in order. */
export function useTokenFormats(): readonly TokenFormat[] {
  return useEditorModules().host.get(tokenFormats);
}
