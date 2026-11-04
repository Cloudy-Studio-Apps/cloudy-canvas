import { Database } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { dataFormats, dataSourceTypes } from "./data.points";
import { CSV_FORMAT, JSON_FORMAT } from "./formats";
import { FILE_SOURCE, HTTP_SOURCE } from "./sources";
import { DataSourceKind } from "./source";
import { DataTab, useDataServices } from "./ui";
import { t } from "./data.i18n";
import * as dataApi from ".";
import * as dataUi from "./ui";

/**
 * Data: sources of data (a file, a link, a sheet) a design's layers can be filled from. It holds
 * the source record, the built-in source types (file, link) and formats (CSV, JSON), the Data tab
 * and the session hook that hands the sources this device's services; bindings and iterators
 * come in later tasks.
 */
export const dataModule = defineModule({
  id: "data",
  tier: "core",
  requires: ["core", "pages", "frame"],
  uses: ["text", "image", "auto-layout"],
  exports: { ...dataApi, ...dataUi },
  register(host) {
    host.contribute(designCanvas.kinds, new DataSourceKind());
    host.contribute(dataSourceTypes, FILE_SOURCE, HTTP_SOURCE);
    host.contribute(dataFormats, CSV_FORMAT, JSON_FORMAT);
    host.contribute(designEditor.leftTabs, {
      id: "data",
      label: t("tab.title"),
      icon: Database,
      order: 25,
      component: DataTab,
    });
    host.contribute(designEditor.sessionHooks, { id: "data.services", use: useDataServices });
  },
});
