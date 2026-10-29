import { useState } from "react";

import { ViewerCodePanel, type ViewerPanelProps } from "../../../viewer/ui";
import { t } from "../../db.i18n";
import type { DbViewerData } from "./db-viewer-part.types";

/** The viewer's schema panel: the clicked table's or enum's DBML, or the whole schema's. */
export function DbViewerPanel({ data, element, close }: ViewerPanelProps<DbViewerData>) {
  const [all, setAll] = useState(false);
  const item = element && !all ? data.items[element.id] : undefined;
  return item ? (
    <ViewerCodePanel
      title={item.name}
      code={item.code}
      onAll={() => setAll(true)}
      onClose={close}
    />
  ) : (
    <ViewerCodePanel title={t("viewer.schema")} code={data.schema} onClose={close} />
  );
}
