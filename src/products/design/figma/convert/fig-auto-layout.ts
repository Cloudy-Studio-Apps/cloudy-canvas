import type { FigNode } from "@canvas/figma";

import type {
  AutoLayout,
  LayoutAlign,
  LayoutCounterAlign,
  LayoutSizing,
  NodeSizing,
} from "../../modules";

/** A Figma frame's auto layout, or `null` without one. */
export function figAutoLayout(node: FigNode): AutoLayout | null {
  const direction =
    node.stackMode === "HORIZONTAL"
      ? "horizontal"
      : node.stackMode === "VERTICAL"
        ? "vertical"
        : null;
  if (!direction) return null;
  return {
    direction,
    wrap: node.stackWrap === "WRAP",
    gap: node.stackSpacing ?? 0,
    counterGap: node.stackCounterSpacing ?? 0,
    padding: {
      top: node.stackVerticalPadding ?? 0,
      right: node.stackPaddingRight ?? 0,
      bottom: node.stackPaddingBottom ?? 0,
      left: node.stackHorizontalPadding ?? 0,
    },
    align: primaryAlign(node.stackPrimaryAlignItems),
    counterAlign: counterAlign(node.stackCounterAlignItems),
    strokesIncluded: node.bordersTakeSpace ?? false,
    reverseStacking: node.stackReverseZIndex ?? false,
  };
}

/**
 * A node's sizing: filling where its auto layout parent stretches or grows it, hugging where its
 * own auto layout does (a text's hugging is its `autoResize`, not stored), else fixed.
 */
export function figSizing(node: FigNode, parent: AutoLayout | null): NodeSizing {
  const own = ownSizing(node);
  if (!parent || node.stackPositioning === "ABSOLUTE") return own;
  const grows = (node.stackChildPrimaryGrow ?? 0) > 0;
  const stretches = node.stackChildAlignSelf === "STRETCH";
  const horizontal = parent.direction === "horizontal";
  return {
    h: (horizontal ? grows : stretches) ? "fill" : own.h,
    v: (horizontal ? stretches : grows) ? "fill" : own.v,
  };
}

function ownSizing(node: FigNode): NodeSizing {
  const layout = figAutoLayout(node);
  if (!layout) return { h: "fixed", v: "fixed" };
  const primary: LayoutSizing = node.stackPrimarySizing === "FIXED" ? "fixed" : "hug";
  const counter: LayoutSizing = node.stackCounterSizing?.startsWith("RESIZE_TO_FIT")
    ? "hug"
    : "fixed";
  return layout.direction === "horizontal"
    ? { h: primary, v: counter }
    : { h: counter, v: primary };
}

function primaryAlign(value: string | undefined): LayoutAlign {
  switch (value) {
    case "CENTER":
      return "center";
    case "MAX":
      return "end";
    case "SPACE_BETWEEN":
      return "space-between";
    default:
      return "start";
  }
}

function counterAlign(value: string | undefined): LayoutCounterAlign {
  switch (value) {
    case "CENTER":
      return "center";
    case "MAX":
      return "end";
    case "BASELINE":
      return "baseline";
    default:
      return "start";
  }
}
