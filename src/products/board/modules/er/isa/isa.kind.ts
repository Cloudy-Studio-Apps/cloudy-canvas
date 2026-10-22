import type { ElementView } from "@canvas";

import { ErKind } from "../base/er.kind";
import { drawErIsa } from "./isa.draw";
import type { ErIsaElement } from "./isa.types";

export class ErIsaKind extends ErKind<ErIsaElement> {
  readonly type = "er-isa";
  readonly label = "Hierarchy";
  readonly description =
    'A generalization (an "is a" triangle) from a parent entity to its children.';

  draw(view: ElementView, el: ErIsaElement): void {
    drawErIsa(view, el);
  }
}
