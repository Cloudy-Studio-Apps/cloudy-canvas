import { Circle, Egg } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { useErDiagram, useErQuery } from "../model";

/** Switches the diagram's attributes between Chen ellipses and lollipop circles. */
export function ErStyleToggle() {
  const er = useErDiagram();
  const lollipop = useErQuery((diagram) => diagram.shapes().attributes[0]?.look === "lollipop");
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={lollipop ? "Use Chen ellipses" : "Use lollipop circles"}
      title={
        lollipop
          ? "Attributes: lollipop (switch to Chen ellipses)"
          : "Attributes: Chen ellipses (switch to lollipop)"
      }
      onClick={() => er.edits.setStyle(lollipop ? "ellipse" : "lollipop")}
    >
      {lollipop ? <Circle /> : <Egg />}
    </Button>
  );
}
