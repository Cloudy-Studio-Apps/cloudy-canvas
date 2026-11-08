import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import { PROTOTYPE_FLOW_DEFAULTS } from "./flow.defaults";
import type { PrototypeFlowDefaults, PrototypeFlowElement } from "./flow.types";

/**
 * A prototype flow is a record, not a layer: never on a page's canvas (`PAGE_SCOPES` shows only
 * nodes), drawn or hit. It's edited through `DESIGN_PROTOTYPE`.
 */
export class PrototypeFlowKind extends ElementKind<PrototypeFlowElement, DesignToolOptions> {
  readonly type = PROTOTYPE_FLOW_TYPE;
  readonly label = "Prototype flow";
  readonly description = "A prototype's flow: the screen it starts at and the device it plays on.";
  override readonly defaults: PrototypeFlowDefaults = PROTOTYPE_FLOW_DEFAULTS;
  override readonly creatable = false;
  override readonly boxed = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  override fillDefaults(el: PrototypeFlowElement): PrototypeFlowElement {
    return {
      ...el,
      orientation: el.orientation ?? PROTOTYPE_FLOW_DEFAULTS.orientation,
      hints: el.hints ?? PROTOTYPE_FLOW_DEFAULTS.hints,
    };
  }
}
