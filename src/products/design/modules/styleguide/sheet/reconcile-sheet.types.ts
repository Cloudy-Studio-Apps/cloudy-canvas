import type { TokenStore } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";

/** What `reconcileSheet` needs besides the document and the kinds. */
export interface ReconcileContext {
  options: DesignToolOptions;
  store: TokenStore;
}
