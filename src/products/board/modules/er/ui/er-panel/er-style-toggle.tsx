import { Circle, Egg } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useErDiagram, useErQuery } from "../model";
import { t } from "../../er.i18n";

/** Switches the diagram's attributes between Chen ellipses and lollipop circles. */
export function ErStyleToggle() {
  const er = useErDiagram();
  const lollipop = useErQuery((diagram) => diagram.shapes().attributes[0]?.look === "lollipop");
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={lollipop ? t("panel.useChen") : t("panel.useLollipop")}
      title={lollipop ? t("panel.styleLollipop") : t("panel.styleChen")}
      onClick={() => er.edits.setStyle(lollipop ? "ellipse" : "lollipop")}
    >
      {lollipop ? <Circle /> : <Egg />}
    </Button>
  );
}
