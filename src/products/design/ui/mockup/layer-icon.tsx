import { Component, Frame, Group, Image, Square, Type } from "lucide-react";

import type { LayerIconProps } from "./layer-icon.types";
import type { MockLayerType } from "./mock-data.types";

const ICONS = {
  frame: Frame,
  group: Group,
  component: Component,
  rectangle: Square,
  text: Type,
  image: Image,
} satisfies Record<MockLayerType, typeof Frame>;

/** The icon shown before a layer's name. */
export function LayerIcon({ type }: LayerIconProps) {
  const Icon = ICONS[type];
  return <Icon className={type === "component" ? "text-design" : undefined} />;
}
