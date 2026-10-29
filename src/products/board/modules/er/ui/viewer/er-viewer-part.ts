import { defineViewerPart } from "../../../viewer/ui";
import { t } from "../../er.i18n";
import { ErModel } from "../../model";
import { ErViewerPanel } from "./er-viewer-panel";
import type { ErViewerData } from "./er-viewer-part.types";

/** Lucide's network, the ER mode's icon, as the viewer draws icons. */
const NETWORK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>';

/** ER diagrams in the HTML viewer: each diagram's ER text, and all of them. */
export const erViewerPart = defineViewerPart<ErViewerData>({
  id: "er",
  types: [
    "er-entity",
    "er-relation",
    "er-attribute",
    "er-isa",
    "er-aggregate",
    "er-constraint",
    "er-union",
  ],
  button: { icon: { svg: NETWORK_ICON }, label: t("viewer.er"), order: 20 },
  collect(doc) {
    const model = new ErModel(doc);
    const infos = model.diagrams();
    if (infos.length === 0) return null;
    const diagrams: ErViewerData["diagrams"] = {};
    for (const info of infos)
      diagrams[info.id] = { name: info.label, text: model.diagram(info.id).text() };
    return { diagrams };
  },
  panel: ErViewerPanel,
});
