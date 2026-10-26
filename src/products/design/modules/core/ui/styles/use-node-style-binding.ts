import type { DesignNode } from "../../node/design-node.types";
import { useFieldBinding } from "@design/ui/hooks";
import type { StyleBinding } from "./styles.types";

/** The style the selected layers use at `path` (`fills`, `effects`, `strokeStyle`…). */
export function useNodeStyleBinding(nodes: readonly DesignNode[], path: string): StyleBinding {
  const { bound, bind } = useFieldBinding(nodes, path);
  return { bound, bind };
}
