import { useState } from "react";

import { ViewerCodePanel, type ViewerPanelProps } from "../../../viewer/ui";
import { isErElement } from "../../base";
import { t } from "../../er.i18n";
import type { ErViewerData } from "./er-viewer-part.types";

/** The viewer's ER panel: the clicked shape's diagram as ER text, or every diagram's. */
export function ErViewerPanel({ data, element, close }: ViewerPanelProps<ErViewerData>) {
  const [all, setAll] = useState(false);
  const shape = element ?? undefined;
  const diagram = isErElement(shape) && !all ? data.diagrams[shape.diagram] : undefined;
  if (diagram) {
    return (
      <ViewerCodePanel
        title={diagram.name}
        code={diagram.text}
        onAll={() => setAll(true)}
        onClose={close}
      />
    );
  }
  const text = Object.values(data.diagrams)
    .map((item) => item.text)
    .join("\n\n");
  return <ViewerCodePanel title={t("viewer.all")} code={text} onClose={close} />;
}
