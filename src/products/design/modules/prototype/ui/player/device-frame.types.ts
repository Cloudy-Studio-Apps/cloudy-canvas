import type { ReactNode } from "react";

import type { PrototypeFlowElement } from "../../model";

export interface DeviceFrameProps {
  flow: PrototypeFlowElement;
  /** What a browser's address bar shows. */
  address: string;
  /** The screen's size on the stage, in CSS pixels. */
  width: number;
  height: number;
  /** The screen's content. */
  children: ReactNode;
}

export interface DeviceChromeProps {
  flow: PrototypeFlowElement;
  address: string;
}
