import type { Paint } from "./paint.types";

/** The node fields `createNodeBase` takes beyond the element base. */
export interface NodeBaseOptions {
  name: string;
  /** Default: the top of the page. */
  parentId?: string | null;
  /** Default: none. */
  fills?: Paint[];
}
