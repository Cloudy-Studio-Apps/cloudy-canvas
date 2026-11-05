import { Database } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas, designMcpTools } from "../../design-points";
import {
  bindDataTool,
  dataIssuesTool,
  dataTools,
  detachDataCopyTool,
  removeRepeatTool,
  repeatLayerTool,
  setRepeatTool,
} from "./mcp";
import { dataFormats, dataSourceTypes } from "./data.points";
import { dataSourceForms } from "./ui/data.points";
import { CSV_FORMAT, JSON_FORMAT } from "./formats";
import { FILE_SOURCE, HTTP_SOURCE } from "./sources";
import { forgetRemovedSources } from "./model";
import { everyRowCopy, syncData } from "./sync";
import { readAroundFrom } from "./repeat/data-around";
import { dataCopyTag, prepareDataCopies, pruneData } from "./repeat";
import { BOUND_TEXT_TEMPLATE } from "./bindings";
import { textTemplates } from "../text";
import { DataSourceKind } from "./source";
import {
  DataCopyBadge,
  DataCopySection,
  DataSection,
  DataTab,
  HttpSourceForm,
  RepeatSection,
  repeatTargets,
  useDataServices,
} from "./ui";
import { t } from "./data.i18n";
import * as dataApi from ".";
import * as dataUi from "./ui";

/**
 * Data: sources of data (a file, a link, a sheet) a design's layers can be filled from. It holds
 * the source record, the built-in source types (file, link) and formats (CSV, JSON), the Data tab
 * and the session hook that hands the sources this device's services, the sync that keeps
 * layers bound to data (and iterators' copies) up to date, and the properties panel's Data
 * section that binds a layer, its Repeat section and the copies' section and badge.
 */
export const dataModule = defineModule({
  id: "data",
  tier: "core",
  requires: ["core", "pages", "frame"],
  uses: ["text", "image", "auto-layout"],
  exports: { ...dataApi, ...dataUi },
  register(host) {
    // Scopes read the loops other modules put around a page (a brochure's) and its language.
    readAroundFrom(host);
    host.contribute(designCanvas.kinds, new DataSourceKind());
    host.contribute(designCanvas.onRemove, forgetRemovedSources);
    host.contribute(designCanvas.onRemove, pruneData);
    host.contribute(designCanvas.prepareCopies, prepareDataCopies);
    host.contribute(designCanvas.afterEdit, (doc, change, kinds) => syncData(doc, change, kinds));
    // Exports draw every row: a copy of the design makes the copies past the design caps.
    host.contribute(designCanvas.exportCopies, everyRowCopy);
    // A bound text is edited as its template; the sync then writes what it shows.
    host.contribute(textTemplates, BOUND_TEXT_TEMPLATE);
    host.contribute(dataSourceTypes, FILE_SOURCE, HTTP_SOURCE);
    host.contribute(dataFormats, CSV_FORMAT, JSON_FORMAT);
    // A link's own form: the connection as a card, edited in the Connection dialog.
    host.contribute(dataSourceForms, { type: HTTP_SOURCE.id, component: HttpSourceForm });
    host.contribute(designEditor.leftTabs, {
      id: "data",
      label: t("tab.title"),
      icon: Database,
      order: 25,
      component: DataTab,
    });
    // One layer's bindings, after Effects and before Export.
    host.contribute(designEditor.propertySections, {
      id: "data.bindings",
      tab: "design",
      order: 85,
      when: ({ nodes }) => nodes.length === 1,
      component: DataSection,
    });
    // Repeating a layer (the card) in its frame, right after the frame's auto layout.
    host.contribute(designEditor.propertySections, {
      id: "data.repeat",
      tab: "design",
      order: 33,
      when: ({ nodes, elements }) => {
        if (nodes.length !== 1) return false;
        const { card, container } = repeatTargets(nodes[0], elements);
        return card !== null || container !== null;
      },
      component: RepeatSection,
    });
    // An iterator's copies are marked, and say which row they show.
    host.contribute(designEditor.layerBadges, { id: "data.copy", component: DataCopyBadge });
    host.contribute(designEditor.propertySections, {
      id: "data.copy",
      tab: "design",
      order: 1,
      when: ({ nodes }) => nodes.some((node) => dataCopyTag(node)),
      component: DataCopySection,
    });
    host.contribute(designMcpTools, {
      id: "data",
      tools: (context) => [
        ...dataTools,
        bindDataTool(context),
        setRepeatTool(context),
        repeatLayerTool(context),
        removeRepeatTool,
        detachDataCopyTool,
        dataIssuesTool(context),
      ],
    });
    host.contribute(designEditor.sessionHooks, { id: "data.services", use: useDataServices });
  },
});
