import { Circle, Egg } from "lucide-react";

import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { useErQuery } from "../../engine/use-er-query";

/** Switches attributes between Chen ellipses and lollipop circles. */
export function ErStyleToggle() {
  const { er } = useEngine();
  const lollipop = useErQuery((model) => model.shapes().attributes[0]?.look === "lollipop");
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
