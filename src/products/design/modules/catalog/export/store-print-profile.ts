import { createId } from "@shared/core";

import type { BrochurePrintProfile } from "../brochure";
import type { DesignWorkspace } from "../../../design-engine.types";

/**
 * Keeps a print shop's `.icc` file in the design, for a brochure's settings. Rejects with a message
 * for the user when it isn't a CMYK print profile.
 */
export async function storePrintProfile(
  workspace: Pick<DesignWorkspace, "doc" | "readPrintProfile">,
  bytes: Uint8Array,
): Promise<BrochurePrintProfile> {
  const { name } = await workspace.readPrintProfile(bytes);
  const assetId = createId();
  workspace.doc.addAsset(assetId, bytes);
  return { assetId, name };
}
