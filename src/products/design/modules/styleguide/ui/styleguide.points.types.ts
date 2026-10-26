import type { ComponentType } from "react";

/** A way to start a design system, offered by the Design system's empty state. */
export interface StyleguideStartAction {
  id: string;
  /** Lower first. The built-in "Add a color" is at 100. */
  order: number;
  /** A button (or a few): `primary` for the most helpful one. */
  component: ComponentType<StyleguideStartActionProps>;
}

export interface StyleguideStartActionProps {
  /** Whether it's the first action shown (it gets the primary look). */
  primary: boolean;
}
