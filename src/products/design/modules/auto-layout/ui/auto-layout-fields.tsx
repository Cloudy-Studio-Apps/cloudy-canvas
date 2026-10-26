import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  BetweenHorizontalStart,
  BetweenVerticalStart,
  Space,
  TextWrap,
  UnfoldHorizontal,
  UnfoldVertical,
} from "lucide-react";

import { layoutOf, type AutoLayout, type DesignNode } from "../../core";
import { layoutPatch } from "../layout-patch";
import {
  NodeCheckbox,
  BindableNumberField,
  BindSlot,
  NodeOptionButtons,
  NumberField,
  PanelIconButton,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import { AlignmentGrid } from "./alignment-grid";
import type { AutoLayoutFieldsProps } from "./auto-layout-fields.types";

const DIRECTIONS = [
  { value: "vertical", label: "Vertical", icon: <ArrowDown /> },
  { value: "horizontal", label: "Horizontal", icon: <ArrowRight /> },
  { value: "wrap", label: "Wrap", icon: <TextWrap /> },
] as const;

/** The settings of frames that have an auto layout, each bound to all of them. */
export function AutoLayoutFields({ frames }: AutoLayoutFieldsProps) {
  const edit = useEditNodes();
  const layout = (node: DesignNode) => layoutOf(node)!;
  const first = layout(frames[0]!);
  const set = (change: Partial<AutoLayout>) => edit(frames, (node) => layoutPatch(node, change));
  const spread = frames.every((node) => layout(node).align === "space-between");
  const field = (key: "gap" | "counterGap") => ({
    nodes: frames,
    read: (node: DesignNode) => layout(node)[key],
    patch: (value: number, node: DesignNode) => layoutPatch(node, { [key]: value })!,
  });
  type Side = "top" | "right" | "bottom" | "left";
  /** The padding of two opposite sides: one value when every frame's two are the same. */
  const padding = (sides: readonly Side[], label: string, prefix: ReactNode) => {
    const both = (node: DesignNode) => {
      const [a, b] = sides.map((side) => layout(node).padding[side]);
      return a === b ? (a ?? null) : null;
    };
    const value = frames.every((node) => both(node) !== null) ? sharedValue(frames, both) : null;
    const commit = (n: number) =>
      edit(frames, (node) => {
        const next = { ...layout(node).padding };
        for (const side of sides) next[side] = n;
        return layoutPatch(node, { padding: next });
      });
    return (
      <BindSlot nodes={frames} path={sides.map((side) => `layout.padding.${side}`)}>
        <NumberField prefix={prefix} label={label} min={0} value={value} onCommit={commit} />
      </BindSlot>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <NodeOptionButtons
        nodes={frames}
        label="Direction"
        options={DIRECTIONS}
        read={(node) => (layout(node).wrap ? "wrap" : layout(node).direction)}
        patch={(value, node) =>
          layoutPatch(
            node,
            value === "wrap"
              ? { direction: "horizontal", wrap: true }
              : { direction: value as AutoLayout["direction"], wrap: false },
          )!
        }
      />
      <div className="flex gap-2">
        <AlignmentGrid layout={first} onPick={set} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1">
            {spread ? (
              <span className="flex h-7 flex-1 items-center rounded-sm bg-muted px-2 text-xs text-muted-foreground">
                Auto gap
              </span>
            ) : (
              <BindableNumberField
                path="layout.gap"
                {...field("gap")}
                label="Gap between layers"
                prefix={
                  first.direction === "horizontal" ? (
                    <BetweenVerticalStart />
                  ) : (
                    <BetweenHorizontalStart />
                  )
                }
                className="flex-1"
              />
            )}
            <PanelIconButton
              label={spread ? "Fixed gap" : "Auto gap (space between)"}
              active={spread}
              onClick={() => set({ align: spread ? "start" : "space-between" })}
            >
              <Space />
            </PanelIconButton>
          </div>
          {first.wrap && (
            <BindableNumberField
              path="layout.counterGap"
              {...field("counterGap")}
              label="Gap between lines"
              prefix={<BetweenHorizontalStart />}
            />
          )}
        </div>
      </div>
      <PropertyGrid>
        {padding(["left", "right"], "Horizontal padding", <UnfoldHorizontal />)}
        {padding(["top", "bottom"], "Vertical padding", <UnfoldVertical />)}
      </PropertyGrid>
      <NodeCheckbox
        nodes={frames}
        label="Strokes included in layout"
        read={(node) => layout(node).strokesIncluded}
        patch={(strokesIncluded, node) => layoutPatch(node, { strokesIncluded })!}
      />
      <NodeCheckbox
        nodes={frames}
        label="First layer on top"
        read={(node) => layout(node).reverseStacking}
        patch={(reverseStacking, node) => layoutPatch(node, { reverseStacking })!}
      />
    </div>
  );
}
