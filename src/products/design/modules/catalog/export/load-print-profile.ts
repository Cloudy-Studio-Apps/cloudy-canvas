import { createId } from "@shared/core";

import type { DesignWorkspace } from "../../../design-engine.types";
import type { DesignBrochure } from "../model";

/**
 * Keeps a print shop's `.icc` file in the design and makes it the brochure's, in CMYK. Rejects with
 * a message for the user when it isn't a CMYK print profile.
 */
export async function loadPrintProfile(
  workspace: Pick<DesignWorkspace, "doc" | "readPrintProfile">,
  brochure: DesignBrochure,
  bytes: Uint8Array,
): Promise<string> {
  const { name } = await workspace.readPrintProfile(bytes);
  const assetId = createId();
  workspace.doc.addAsset(assetId, bytes);
  brochure.setSettings({ colorMode: "cmyk", printProfile: { assetId, name } });
  return name;
}
