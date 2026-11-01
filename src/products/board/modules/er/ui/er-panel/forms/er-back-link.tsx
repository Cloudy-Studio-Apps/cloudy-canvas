import { ArrowLeft } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useErShape } from "../../model";
import { shapeLabel } from "./shape-label";
import { useErGoTo } from "./use-er-go-to";

/** Back to the shape the panel came from; nothing when it wasn't reached from another shape. */
export function ErBackLink() {
  const { back, previous } = useErGoTo();
  const shape = useErShape(previous ?? "");
  if (!shape) return null;
  return (
    <Button variant="ghost" size="sm" onClick={back}>
      <ArrowLeft />
      {shapeLabel(shape)}
    </Button>
  );
}
