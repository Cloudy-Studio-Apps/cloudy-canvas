import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { PROTOTYPE_FLOW_TYPE, PROTOTYPE_PLATFORMS } from "../prototype.constants";
import { firstDevice, PROTOTYPE_DEVICES } from "./devices";
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

  /**
   * Every read of a flow passes here, so a record from a newer version, a peer or a plugin is
   * safe to use: an unknown platform reads as the first one, an unknown device as its platform's
   * first. Nothing is written back by reading.
   */
  override fillDefaults(el: PrototypeFlowElement): PrototypeFlowElement {
    const platform = PROTOTYPE_PLATFORMS.includes(el.platform)
      ? el.platform
      : PROTOTYPE_PLATFORMS[0];
    const device =
      platform !== undefined && PROTOTYPE_DEVICES[platform].includes(el.device)
        ? el.device
        : firstDevice(platform ?? "mobile");
    return {
      ...el,
      platform: platform ?? "mobile",
      device,
      orientation: el.orientation ?? PROTOTYPE_FLOW_DEFAULTS.orientation,
      hints: el.hints ?? PROTOTYPE_FLOW_DEFAULTS.hints,
    };
  }
}
