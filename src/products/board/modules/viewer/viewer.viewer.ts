import { defineModule } from "@shared/core";
import * as viewerApi from ".";
import * as viewerUi from "./ui";

/** The viewer module in the HTML viewer: only its public API, which plugins require. */
export const viewerViewerModule = defineModule({
  id: "viewer",
  tier: "feature",
  exports: { ...viewerApi, ...viewerUi },
  register() {},
});
