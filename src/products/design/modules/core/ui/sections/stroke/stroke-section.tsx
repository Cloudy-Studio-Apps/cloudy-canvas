import { Minus } from "lucide-react";

import {
  DesignNodeKind,
  NODE_DEFAULTS,
  STROKE_STYLE,
  STROKE_STYLE_PATH,
  strokeBindingsOf,
  strokeStyleOfNode,
  type DesignNode,
} from "@design";
import {
  BindableNumberField,
  NodeSelectField,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import {
  createNodeStyle,
  StyleChip,
  StyleControl,
  useNodeStyleBinding,
} from "@design/ui/components/styles";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "../paint-list-section";
import { ALIGNS } from "./stroke-options";
import { StrokeSettings } from "./stroke-settings";
import { SIDES, sidePatch, sidesMode, weightPatch } from "./stroke-sides";
import { StrokeSidesMenu } from "./stroke-sides-menu";

const SIDE_LABELS = { top: "T", right: "R", bottom: "B", left: "L" } as const;

/**
 * The selection's strokes: their paints, where they sit (closed outlines only), their weight or
 * each side's (boxes), and the settings popover (dashes, ends, corners).
 */
export function StrokeSection({ selection: { nodes, kinds } }: PropertySectionProps) {
  const kindOf = (node: DesignNode) => {
    const kind = kinds.kindOf(node);
    return kind instanceof DesignNodeKind ? kind : null;
  };
  const contours = (node: DesignNode) => kindOf(node)?.geometry(node)?.stroke.contours ?? [];
  const closed = nodes.some((node) => contours(node).some((contour) => contour.closed));
  const openEnds = nodes.some((node) => contours(node).some((contour) => !contour.closed));
  const sided = nodes.length > 0 && nodes.every((node) => kindOf(node)?.sidedStrokes);
  const custom = sided && sharedValue(nodes, sidesMode) === "custom";
  const engine = useDesignEngine();
  const strokeStyle = useNodeStyleBinding(nodes, STROKE_STYLE_PATH);
  const styleControl = (
    <StyleControl
      binding={strokeStyle}
      styleType={STROKE_STYLE}
      label="Stroke styles"
      createLabel="Create style from this stroke"
      create={() => createNodeStyle(engine, STROKE_STYLE, strokeStyleOfNode, strokeBindingsOf)}
    />
  );

  return (
    <PaintListSection
      title="Strokes"
      field="strokes"
      nodes={nodes}
      allowImage
      newPaint={() => ({ ...NODE_DEFAULTS.stroke })}
    >
      {strokeStyle.bound !== undefined ? (
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <StyleChip binding={strokeStyle} />
          </div>
          {styleControl}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {closed && (
              <div className="min-w-0 flex-1">
                <NodeSelectField
                  nodes={nodes}
                  label="Stroke position"
                  read={(node) => node.strokeAlign}
                  patch={(value) => ({ strokeAlign: value as "inside" })}
                  options={ALIGNS}
                />
              </div>
            )}
            {!custom && (
              <BindableNumberField
                path="strokeWeight"
                nodes={nodes}
                prefix={<Minus />}
                label="Stroke weight"
                min={0}
                className="min-w-0 flex-1"
                read={(node) => node.strokeWeight}
                patch={weightPatch}
              />
            )}
            {sided && <StrokeSidesMenu nodes={nodes} />}
            <StrokeSettings nodes={nodes} openEnds={openEnds} />
            {styleControl}
          </div>
          {custom && (
            <PropertyGrid>
              {SIDES.map((side) => (
                <BindableNumberField
                  path={`strokeWeights.${side}`}
                  key={side}
                  nodes={nodes}
                  prefix={SIDE_LABELS[side]}
                  label={`${side[0]!.toUpperCase()}${side.slice(1)} stroke weight`}
                  min={0}
                  read={(node) => node.strokeWeights?.[side] ?? node.strokeWeight}
                  patch={(weight, node) => sidePatch(side, weight, node)}
                />
              ))}
            </PropertyGrid>
          )}
        </>
      )}
    </PaintListSection>
  );
}
